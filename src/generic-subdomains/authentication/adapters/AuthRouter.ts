import { Elysia } from 'elysia';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';
import { AuthClientSchema } from '../ports/schemas/AuthClientSchema';
import { SetupPlugin } from '../../utils/plugins/setupPlugin';
import { LoginSchema } from '../ports/schemas/loginSchema';
import type { AuthControllerServices } from '../ports/Services';
import { setUpCookieTokenOptions } from 'config';

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
