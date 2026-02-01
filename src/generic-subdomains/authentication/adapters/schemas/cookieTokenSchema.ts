import { AppError } from '@AppError';
import { t } from 'elysia';

export const cookieTokenSchema = t.Cookie(
	{
		token: t.String({
			error: () => {
				throw new AppError({
					statusCode: 401,
					message: 'Authentication cookie is missing or invalid',
					code: 'UNAUTHORIZED',
				});
			},
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
