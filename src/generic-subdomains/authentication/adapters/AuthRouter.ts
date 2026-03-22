import { Elysia, type CookieOptions } from 'elysia';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';
import { AuthClientSchema } from '../ports/schemas/AuthClientSchema';
import { SetupPlugin } from '../../utils/plugins/setupPlugin';
import { LoginSchema } from '../ports/schemas/loginSchema';
import type { AuthControllerServices } from '../ports/Services';

function setUpCookieTokenOptions(token: CookieOptions) {
	const isProd = process.env.NODE_ENV === 'production';
	const isCrossSite = process.env.CROSS_SITE_COOKIES === 'true';

	token.httpOnly = true;
	token.path = '/';
	token.maxAge = isProd ? 60 * 60 * 24 * 7 : 60 * 60;
	token.secure = isProd || isCrossSite;
	token.sameSite = isProd || isCrossSite ? 'none' : 'lax';

	const cookieDomain = process.env.COOKIE_DOMAIN;
	if (cookieDomain) {
		token.domain = cookieDomain;
	}
}

export function createAuthRouter(services: AuthControllerServices) {
	const { login } = services;

	return new Elysia({ prefix: '/auth' }).use(SetupPlugin).post(
		'/login',
		async ({ body, cookie, auth }) => {
			const result = await login({
				email: body.email,
				password: body.password,
			});

			cookie.token!.value = result.token;
			setUpCookieTokenOptions(cookie.token!);

			auth.clientId = result.client.id;
			auth.clientRole = result.client.role;
			auth.clientStatus = result.client.status;
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
					'Authenticates a user and returns a JWT token in an HTTP-only cookie.',
				tags: ['Auth'],
			},
		},
	);
}
