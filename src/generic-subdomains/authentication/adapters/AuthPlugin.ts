import { Elysia } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';
import { CookieTokenSchema } from '../ports/schemas/CookieTokenSchema';
import type { AuthPluginServices } from '../ports/Services';

export function createAuthPlugin({ authenticate }: AuthPluginServices) {
	return new Elysia().use(SetupPlugin).guard({
		as: 'scoped',
		beforeHandle: async ({ cookie, store, auth }) => {
			const authInitiatedAt = performance.now();

			try {
				const token = cookie.token.value;
				const client = await authenticate(token);

				auth.clientRole = client.role;
				auth.clientId = client.id;
				auth.clientStatus = client.status;
			} finally {
				store.authTiming = Math.round(performance.now() - authInitiatedAt);
			}
		},
		response: {
			401: appErrorSchema,
		},
		cookie: CookieTokenSchema,
	});
}
