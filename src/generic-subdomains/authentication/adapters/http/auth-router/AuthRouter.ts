import { Elysia, type CookieOptions } from 'elysia';
import { SetupPlugin } from '@GenericSubdomains/utils/plugins/setupPlugin';
import { appErrorSchema } from '@AppError';
import { loginSchema } from '../../../ports/schemas/loginSchema';
import type { AuthControllerServices } from '../../Services';
import { loginResponseSchema } from '@GenericSubdomains/authentication/ports/schemas/LoginResponseSchema';

function setUpCookieTokenOptions(token: CookieOptions) {
	token.httpOnly = process.env.NODE_ENV === 'prod';
	token.path = '/';
	token.maxAge = process.env.NODE_ENV === 'prod' ? 60 * 60 * 24 * 7 : 60 * 60;
	token.secure = process.env.NODE_ENV === 'prod';
	token.sameSite = process.env.NODE_ENV === 'prod' ? 'none' : 'lax';
}

export function createAuthRouter(services: AuthControllerServices) {
	const { login } = services;

	return new Elysia({ prefix: '/auth' }).use(SetupPlugin).post(
		'/login',
		async ({ body, cookie, auth }) => {
			const result = await login(body.email, body.password);

			cookie.token!.value = result.token;
			setUpCookieTokenOptions(cookie.token!);

			auth.clientId = result.client.id;
			auth.clientRole = result.client.role;
			auth.clientStatus = result.client.status;
			return result.client;
		},
		{
			body: loginSchema,
			response: {
				200: loginResponseSchema,
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
