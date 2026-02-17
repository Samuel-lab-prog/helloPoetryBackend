import { Elysia, type CookieOptions } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthClientSchema } from '../ports/schemas/AuthClientSchema';
import { SetupPlugin } from '../../utils/plugins/setupPlugin';
import { LoginSchema } from '../ports/schemas/LoginSchema';
import type { AuthControllerServices } from '../ports/Services';

function setUpCookieTokenOptions(token: CookieOptions) {
	token.httpOnly = process.env.NODE_ENV === 'production';
	token.path = '/';
	token.maxAge =
		process.env.NODE_ENV === 'production' ? 60 * 60 * 24 * 7 : 60 * 60;
	token.secure = process.env.NODE_ENV === 'production';
	token.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
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
