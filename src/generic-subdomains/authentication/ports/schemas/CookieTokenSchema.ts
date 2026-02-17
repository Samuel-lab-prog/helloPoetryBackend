import { AppError } from '@AppError';
import { t } from 'elysia';

export const CookieTokenSchema = t.Cookie(
	{
		token: t.String({
			examples: ['eyJhbGciOiddkfksdofksdofksfoaksfof'],
		}),
	},
	{
		error: () => {
			throw new AppError({
				statusCode: 401,
				message: 'Authentication cookie is missing or invalid',
				code: 'UNAUTHORIZED',
			});
		},
	},
);
