import { Elysia } from 'elysia';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';
import { AuthClientSchema } from '../ports/schemas/AuthClientSchema';
import { RefreshCookieTokenSchema } from '../ports/schemas/RefreshCookieTokenSchema';
import { SetupPlugin } from '../../utils/plugins/setupPlugin';
import { LoginSchema } from '../ports/schemas/loginSchema';
import type { AuthControllerServices } from '../ports/externalServices';
import {
	CSRF_COOKIE_NAME,
	setUpRefreshCookieOptions,
	setUpCookieTokenOptions,
	setUpCsrfCookieOptions,
} from 'server-config/config';

export function createAuthRouter(services: AuthControllerServices) {
	const { login, refreshSession } = services;

	return new Elysia({ prefix: '/auth' })
		.use(SetupPlugin)
		.post(
			'/login',
			async ({ body, cookie, auth, set }) => {
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
				// Ensure a JSON response for the frontend to parse.
				set.status = 200;
				set.headers['content-type'] = 'application/json';
				return result.client;
			},
			{
				body: LoginSchema,
				response: {
					200: AuthClientSchema,
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
			async ({ cookie, auth, set }) => {
				const refreshToken = cookie.refreshToken!.value;
				const result = await refreshSession(refreshToken);

				cookie.token!.value = result.accessToken;
				setUpCookieTokenOptions(cookie.token!);

				cookie.refreshToken!.value = result.refreshToken;
				setUpRefreshCookieOptions(cookie.refreshToken!);

				auth.clientId = result.client.id;
				auth.clientRole = result.client.role;
				auth.clientStatus = result.client.status;

				set.status = 200;
				set.headers['content-type'] = 'application/json';
				return result.client;
			},
			{
				cookie: RefreshCookieTokenSchema,
				response: {
					200: AuthClientSchema,
					401: appErrorSchema,
				},
				detail: {
					summary: 'Refresh session',
					description:
						'Refreshes access and refresh tokens using the refresh token cookie.',
					tags: ['Auth'],
				},
			},
		);
}
