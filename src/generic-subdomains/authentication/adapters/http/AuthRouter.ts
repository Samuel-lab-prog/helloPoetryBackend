import { Elysia, t, type CookieOptions } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@AppError';
import { loginSchema } from '@GeneralSchemas';
import { login } from '../../services/login';

function setUpCookieTokenOptions(token: CookieOptions) {
	token.httpOnly = process.env.NODE_ENV === 'prod';
	token.path = '/';
	token.maxAge = 60 * 60 * 24 * 7;
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

	return new Elysia().group('/auth', (app) =>
		app.use(SetupPlugin).post(
			'/login',
			async ({ body, cookie, set, store }) => {
				const authInitiated = performance.now();
				const result = await login(body.email, body.password);

				cookie.token!.value = result.token;
				setUpCookieTokenOptions(cookie.token!);

				set.status = 204;
				store.clientId = result.client.id;
				store.clientRole = result.client.role as
					| 'user'
					| 'author'
					| 'moderator';
				store.authTiming = Math.round(performance.now() - authInitiated);
			},
			{
				body: loginSchema,
				response: {
					204: t.Void(),
					401: appErrorSchema,
					422: appErrorSchema,
					500: appErrorSchema,
				},
				detail: {
					summary: 'Login',
					description:
						'Authenticates a user and returns a JWT token in an HTTP-only cookie.',
					tags: ['Auth'],
				},
			},
		),
	);
}

export const authRouter = createAuthRouter({ login });
