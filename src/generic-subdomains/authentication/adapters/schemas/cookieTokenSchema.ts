import { AppError } from '@AppError';
import { t } from 'elysia';

export const cookieTokenSchema = t.Cookie(
	{
		token: t.String({
			error: () => {
				throw new AppError({
					statusCode: 401,
					errorMessages: ['Authentication cookie is missing or invalid'],
				});
			},
		}),
	},
	{
		error: () => {
			throw new AppError({
				statusCode: 401,
				errorMessages: ['Authentication cookie is missing or invalid'],
			});
		},
	},
);
