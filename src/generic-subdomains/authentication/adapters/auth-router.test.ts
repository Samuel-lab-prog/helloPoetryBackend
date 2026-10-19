import { describe, expect, it } from 'bun:test';
import { createAuthRouter } from './auth-router';

const router = createAuthRouter({
	login: () => Promise.reject(new Error('Login is not used by this test.')),
	refreshSession: () =>
		Promise.reject(new Error('Refresh is not used by this test.')),
});

describe('UNIT - Authentication router CSRF bootstrap', () => {
	it('issues a readable CSRF cookie and returns its matching token', async () => {
		const response = await router.handle(
			new Request('http://localhost/auth/csrf'),
		);
		const body = (await response.json()) as { csrfToken: string };
		const setCookie = response.headers.get('set-cookie') ?? '';

		expect(response.status).toBe(200);
		expect(body.csrfToken).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
		expect(setCookie).toContain(`csrf_token=${body.csrfToken}`);
		expect(setCookie.toLowerCase()).not.toContain('httponly');
		expect(setCookie.toLowerCase()).toContain('samesite=lax');
	});

	it('expires the authentication and CSRF cookies on logout', async () => {
		const response = await router.handle(
			new Request('http://localhost/auth/logout', { method: 'POST' }),
		);
		const setCookie = response.headers.get('set-cookie') ?? '';

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(setCookie).toContain('token=');
		expect(setCookie).toContain('refreshToken=');
		expect(setCookie).toContain('csrf_token=');
		expect(setCookie.match(/Max-Age=0/gi)).toHaveLength(3);
		expect(
			setCookie.match(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/gi),
		).toHaveLength(3);
	});
});
