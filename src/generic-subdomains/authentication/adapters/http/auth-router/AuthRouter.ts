import { Elysia, t, type CookieOptions } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@AppError';
import { loginSchema } from '../../schemas/loginSchema';

import { BcryptHashService } from '../../../infra/hashing/BcryptHashService';
import { JwtTokenService } from '../../../infra/token/JwtTokenService';
import { AuthPrismaRepository } from '../../../infra/repository/repository';
import { loginClientFactory } from '../../../use-cases/login/login';

function setUpCookieTokenOptions(token: CookieOptions) {
	token.httpOnly = process.env.NODE_ENV === 'prod';
	token.path = '/';
	token.maxAge = process.env.NODE_ENV === 'prod' ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days in prod, 60 * 60 seconds in dev
	token.secure = process.env.NODE_ENV === 'prod';
	token.sameSite = process.env.NODE_ENV === 'prod' ? 'none' : 'lax';
}

interface LoginResponse {
	token: string;
	client: { id: number; role: string };
}

interface AuthControllerServices {
	login: (email: string, password: string) => Promise<LoginResponse>;
}

export function createAuthRouter(services: AuthControllerServices) {
	const { login } = services;

	return new Elysia({ prefix: '/auth' }).use(SetupPlugin).post(
		'/login',
		async ({ body, cookie, set, auth }) => {
			const result = await login(body.email, body.password);

			cookie.token!.value = result.token;
			setUpCookieTokenOptions(cookie.token!);

			set.status = 204;

			auth.clientId = result.client.id;
			auth.clientRole = result.client.role as 'user' | 'author' | 'moderator';
		},
		{
			body: loginSchema,
			response: {
				204: t.Void(),
				401: appErrorSchema,
				400: appErrorSchema,
				422: appErrorSchema,
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

export const login = loginClientFactory({
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});

export const authRouter = createAuthRouter({ login });
