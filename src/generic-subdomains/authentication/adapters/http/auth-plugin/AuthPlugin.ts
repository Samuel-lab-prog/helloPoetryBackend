import { Elysia } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@AppError';
import { cookieTokenSchema } from '../../schemas/schemas';

import { authenticateClientFactory } from '../../../use-cases/authenticate/authenticate';
import { JwtTokenService } from '../../../infra/token/JwtTokenService';
import { AuthPrismaRepository } from '../../../infra/repository/repository';

interface Dependencies {
	authenticate: (token: string) => Promise<{
		id: number;
		role: string;
	}>;
}

export function createAuthPlugin({ authenticate }: Dependencies) {
	return new Elysia().use(SetupPlugin).guard({
		as: 'scoped',
		beforeHandle: async ({ cookie, store, auth }) => {
			const authInitiatedAt = performance.now();

			try {
				const token = cookie.token.value;
				const client = await authenticate(token);

				auth.clientRole = client.role;
				auth.clientId = client.id;
			} finally {
				store.authTiming = Math.round(performance.now() - authInitiatedAt);
			}
		},
		response: {
			401: appErrorSchema,
		},
		cookie: cookieTokenSchema,
	});
}

const authenticate = authenticateClientFactory({
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});

export const AuthPlugin = createAuthPlugin({ authenticate });
