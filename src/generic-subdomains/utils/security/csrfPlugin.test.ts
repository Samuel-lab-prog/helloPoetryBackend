import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
const { ErrorPlugin } = await import('../error-handling/error-plugin/util');
import { createAuthRouter } from '../../authentication/adapters/auth-router';
import { createCsrfOriginValidator, createCsrfPlugin } from './csrfPlugin';

const app = new Elysia()
	.use(
		createCsrfPlugin({
			isEnabled: () => true,
			isOriginAllowed: (origin) => origin === 'http://trusted.example',
			shouldSkip: () => false,
		}),
	)
	.use(ErrorPlugin)
	.post('/unsafe', () => ({ ok: true }));

const makeRequest = (headers: Record<string, string> = {}) =>
	new Request('http://localhost/unsafe', {
		method: 'POST',
		headers: {
			origin: 'http://trusted.example',
			...headers,
		},
	});

describe('UNIT - CSRF plugin', () => {
	it('uses the CORS allowlist as the default CSRF trust boundary', () => {
		const isAllowed = createCsrfOriginValidator(
			['https://frontend.example'],
			[],
		);

		expect(isAllowed('https://frontend.example')).toBe(true);
		expect(isAllowed('https://attacker.example')).toBe(false);
		expect(isAllowed('')).toBe(false);
	});

	it('intersects an explicit CSRF allowlist with the CORS allowlist', () => {
		const isAllowed = createCsrfOriginValidator(
			['https://frontend.example', 'https://admin.example'],
			['https://frontend.example'],
		);

		expect(isAllowed('https://frontend.example')).toBe(true);
		expect(isAllowed('https://admin.example')).toBe(false);
		expect(
			createCsrfOriginValidator([], [])('https://unconfigured.example'),
		).toBe(false);
	});

	it('blocks unsafe requests without a token after plugin composition', async () => {
		const response = await app.handle(makeRequest());

		expect(response.status).toBe(403);
	});

	it('allows a matching CSRF cookie and header', async () => {
		const response = await app.handle(
			makeRequest({
				cookie: 'csrf_token=matching-token',
				'x-csrf-token': 'matching-token',
			}),
		);

		expect(response.status).toBe(200);
	});

	it('blocks a mismatched CSRF cookie and header', async () => {
		const response = await app.handle(
			makeRequest({
				cookie: 'csrf_token=cookie-token',
				'x-csrf-token': 'header-token',
			}),
		);

		expect(response.status).toBe(403);
	});

	it('blocks unsafe requests with an untrusted Origin', async () => {
		const response = await app.handle(
			new Request('http://localhost/unsafe', {
				method: 'POST',
				headers: {
					origin: 'http://untrusted.example',
					cookie: 'csrf_token=matching-token',
					'x-csrf-token': 'matching-token',
				},
			}),
		);

		expect(response.status).toBe(403);
	});

	it('blocks unsafe requests without Origin or Referer even with a valid token', async () => {
		const response = await app.handle(
			new Request('http://localhost/unsafe', {
				method: 'POST',
				headers: {
					cookie: 'csrf_token=matching-token',
					'x-csrf-token': 'matching-token',
				},
			}),
		);

		expect(response.status).toBe(403);
	});
});

describe('INTEGRATION - CSRF on authentication routes', () => {
	const refreshSession = () =>
		Promise.resolve({
			accessToken: 'new-access',
			refreshToken: 'new-refresh',
			client: { id: 7, role: 'author' as const, status: 'active' as const },
		});
	const login = () =>
		Promise.resolve({
			accessToken: 'access',
			refreshToken: 'refresh',
			client: { id: 7, role: 'author' as const, status: 'active' as const },
		});
	const authApp = new Elysia({ prefix: '/api/v1' })
		.use(
			createCsrfPlugin({
				isEnabled: () => true,
				isOriginAllowed: (origin) => origin === 'http://trusted.example',
				shouldSkip: (pathname) => pathname === '/api/v1/auth/login',
			}),
		)
		.use(ErrorPlugin)
		.use(createAuthRouter({ login, refreshSession }));
	const logoutRequest = (headers: Record<string, string> = {}) =>
		new Request('http://localhost/api/v1/auth/logout', {
			method: 'POST',
			headers: {
				origin: 'http://trusted.example',
				...headers,
			},
		});

	const refreshRequest = (headers: Record<string, string> = {}) =>
		new Request('http://localhost/api/v1/auth/refresh', {
			method: 'POST',
			headers: {
				origin: 'http://trusted.example',
				cookie: 'refreshToken=old-refresh; csrf_token=csrf-value',
				...headers,
			},
		});

	it('allows the login route without a prior CSRF token and issues one', async () => {
		const response = await authApp.handle(
			new Request('http://localhost/api/v1/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					email: 'person@example.test',
					password: 'password',
				}),
			}),
		);

		expect(response.status).toBe(200);
		const setCookie = response.headers.get('set-cookie') ?? '';
		expect(setCookie).toContain('token=access');
		expect(setCookie).toContain('refreshToken=refresh');
		expect(setCookie).toContain('csrf_token=');
	});

	it('rejects refresh without a CSRF token', async () => {
		const response = await authApp.handle(refreshRequest());

		expect(response.status).toBe(403);
	});

	it('rejects refresh from an untrusted origin even with matching token', async () => {
		const response = await authApp.handle(
			refreshRequest({
				origin: 'http://untrusted.example',
				'x-csrf-token': 'csrf-value',
			}),
		);

		expect(response.status).toBe(403);
	});

	it('allows refresh with trusted origin and matching cookie/header token', async () => {
		const response = await authApp.handle(
			refreshRequest({ 'x-csrf-token': 'csrf-value' }),
		);

		expect(response.status).toBe(200);
	});

	it('rejects logout without a CSRF token, including when unauthenticated', async () => {
		const response = await authApp.handle(logoutRequest());

		expect(response.status).toBe(403);
	});

	it('rejects logout with an invalid CSRF token', async () => {
		const response = await authApp.handle(
			logoutRequest({
				cookie: 'csrf_token=cookie-token',
				'x-csrf-token': 'wrong-token',
			}),
		);

		expect(response.status).toBe(403);
	});

	it('allows an unauthenticated logout with a valid CSRF token', async () => {
		const response = await authApp.handle(
			logoutRequest({
				cookie: 'csrf_token=matching-token',
				'x-csrf-token': 'matching-token',
			}),
		);

		expect(response.status).toBe(200);
	});

	it('expires all browser authentication cookies after trusted CSRF validation', async () => {
		const response = await authApp.handle(
			logoutRequest({
				cookie: 'token=access; refreshToken=refresh; csrf_token=matching-token',
				'x-csrf-token': 'matching-token',
			}),
		);
		const setCookie = response.headers.get('set-cookie') ?? '';

		expect(response.status).toBe(200);
		expect(setCookie).toContain('token=');
		expect(setCookie).toContain('refreshToken=');
		expect(setCookie).toContain('csrf_token=');
		expect(setCookie.match(/Max-Age=0/gi)).toHaveLength(3);
	});

	it('does not accept a refresh request after the browser cookies are cleared', async () => {
		const response = await authApp.handle(
			refreshRequest({
				cookie: 'csrf_token=csrf-value',
				'x-csrf-token': 'csrf-value',
			}),
		);

		expect(response.status).toBe(422);
	});

	it('allows another account to log in after the previous browser session is logged out', async () => {
		const switchingApp = new Elysia({ prefix: '/api/v1' })
			.use(
				createCsrfPlugin({
					isEnabled: () => true,
					isOriginAllowed: (origin) => origin === 'http://trusted.example',
					shouldSkip: (pathname) => pathname === '/api/v1/auth/login',
				}),
			)
			.use(ErrorPlugin)
			.use(
				createAuthRouter({
					login: ({ email }) =>
						Promise.resolve({
							accessToken: `access-${email}`,
							refreshToken: `refresh-${email}`,
							client: {
								id: email === 'first@example.test' ? 1 : 2,
								role: 'author' as const,
								status: 'active' as const,
							},
						}),
					refreshSession,
				}),
			);
		const firstLogin = await switchingApp.handle(
			new Request('http://localhost/api/v1/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					email: 'first@example.test',
					password: 'password',
				}),
			}),
		);
		const firstCsrfToken = firstLogin.headers
			.get('set-cookie')
			?.match(/csrf_token=([^;,]+)/)?.[1];
		expect(firstCsrfToken).toBeTruthy();

		const logout = await switchingApp.handle(
			new Request('http://localhost/api/v1/auth/logout', {
				method: 'POST',
				headers: {
					origin: 'http://trusted.example',
					cookie: `token=access-first; refreshToken=refresh-first; csrf_token=${firstCsrfToken}`,
					'x-csrf-token': firstCsrfToken!,
				},
			}),
		);
		expect(logout.status).toBe(200);

		const secondLogin = await switchingApp.handle(
			new Request('http://localhost/api/v1/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					email: 'second@example.test',
					password: 'password',
				}),
			}),
		);
		const secondClient = await secondLogin.json();
		const secondCookies = secondLogin.headers.get('set-cookie') ?? '';

		expect(secondLogin.status).toBe(200);
		expect(secondClient).toMatchObject({ id: 2 });
		expect(secondCookies).toContain('access-second%40example.test');
		expect(secondCookies).toContain('refresh-second%40example.test');
	});
});
