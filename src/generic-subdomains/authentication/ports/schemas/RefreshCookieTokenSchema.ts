import { AppError } from '@GenericSubdomains/utils/AppError';
import { t } from 'elysia';

export const RefreshCookieTokenSchema = t.Cookie(
	{
		refreshToken: t.String(),
	},
	{
		error: () => {
			throw new AppError({
				statusCode: 401,
				message: 'Refresh token cookie is missing or invalid',
				code: 'UNAUTHORIZED',
			});
		},
	},
);
