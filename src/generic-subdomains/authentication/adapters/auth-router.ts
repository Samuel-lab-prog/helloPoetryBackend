import { appErrorSchema } from '@AppError';
import { Elysia, t, type Cookie } from 'elysia';
import {
	CSRF_COOKIE_NAME,
	setUpCookieTokenOptions,
	setUpCsrfCookieOptions,
	setUpRefreshCookieOptions,
} from 'server-config/config';
import { SetupPlugin } from '../../utils/security/setupPlugin';
import type { AuthControllerServices } from '../ports/externalServices';
import {
	authClientSchema,
	loginSchema,
	refreshCookieTokenSchema,
} from '../ports/schemas';

function issueCsrfToken(cookie: Record<string, Cookie<unknown>>) {
	const csrfToken = crypto.randomUUID();
	cookie[CSRF_COOKIE_NAME]!.value = csrfToken;
	setUpCsrfCookieOptions(cookie[CSRF_COOKIE_NAME]!);
	return { csrfToken };
}

function expireAuthCookies(cookie: Record<string, Cookie<unknown>>) {
	for (const name of ['token', 'refreshToken', CSRF_COOKIE_NAME]) {
		const authCookie = cookie[name]!;
		authCookie.value = '';
		if (name === CSRF_COOKIE_NAME) {
			setUpCsrfCookieOptions(authCookie);
		} else if (name === 'refreshToken') {
			setUpRefreshCookieOptions(authCookie);
		} else {
			setUpCookieTokenOptions(authCookie);
		}
		authCookie.maxAge = 0;
		authCookie.expires = new Date(0);
	}
}

function logoutAuthSession(cookie: Record<string, Cookie<unknown>>) {
	expireAuthCookies(cookie);
	return { success: true as const };
}

const csrfBootstrapRouteOptions = {
	response: {
		200: t.Object({ csrfToken: t.String() }),
	},
	detail: {
		summary: 'Get CSRF token',
		description:
			'Issues a CSRF cookie and token for unauthenticated browser requests.',
		tags: ['Auth'],
	},
};

const refreshRouteOptions = {
	cookie: refreshCookieTokenSchema,
	response: {
		200: authClientSchema,
		401: appErrorSchema,
	},
	detail: {
		summary: 'Refresh session',
		description:
			'Refreshes access and refresh tokens using the refresh token cookie.',
		tags: ['Auth'],
	},
};

const logoutRouteOptions = {
	response: { 200: t.Object({ success: t.Literal(true) }) },
	detail: {
		summary: 'Logout',
		description:
			'Expires the access, refresh, and CSRF cookies for this browser.',
		tags: ['Auth'],
	},
};

export function createAuthRouter(services: AuthControllerServices) {
	const { login, refreshSession } = services;

	return new Elysia({ prefix: '/auth' })
		.use(SetupPlugin)
		.get(
			'/csrf',
			({ cookie }) => issueCsrfToken(cookie),
			csrfBootstrapRouteOptions,
		)
		.post(
			'/login',
			async ({ body, cookie, auth }) => {
				const result = await login({
					email: body.email,
					password: body.password,
				});

				cookie.token!.value = result.accessToken;
				setUpCookieTokenOptions(cookie.token!);

				cookie.refreshToken!.value = result.refreshToken;
				setUpRefreshCookieOptions(cookie.refreshToken!);

				const csrfToken = crypto.randomUUID();
				cookie[CSRF_COOKIE_NAME]!.value = csrfToken;
				setUpCsrfCookieOptions(cookie[CSRF_COOKIE_NAME]!);

				auth.clientId = result.client.id;
				auth.clientRole = result.client.role;
				auth.clientStatus = result.client.status;

				return result.client;
			},
			{
				body: loginSchema,
				response: {
					200: authClientSchema,
					400: appErrorSchema,
					401: appErrorSchema,
				},
				detail: {
					summary: 'Login',
					description:
						'Authenticates a user and returns access/refresh tokens in HTTP-only cookies.',
					tags: ['Auth'],
				},
			},
		)
		.post(
			'/refresh',
			async ({ cookie, auth }) => {
				const refreshToken = cookie.refreshToken!.value;
				const result = await refreshSession(refreshToken);

				cookie.token!.value = result.accessToken;
				setUpCookieTokenOptions(cookie.token!);

				cookie.refreshToken!.value = result.refreshToken;
				setUpRefreshCookieOptions(cookie.refreshToken!);

				auth.clientId = result.client.id;
				auth.clientRole = result.client.role;
				auth.clientStatus = result.client.status;

				return result.client;
			},
			refreshRouteOptions,
		)
		.post(
			'/logout',
			({ cookie }) => logoutAuthSession(cookie),
			logoutRouteOptions,
		);
}
