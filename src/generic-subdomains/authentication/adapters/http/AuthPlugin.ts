import { Elysia } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@AppError';

import { authenticateClientFactory } from '../../use-cases/authenticate/authenticate.ts';
import { JwtTokenService } from '../../infra/token/JwtTokenService.ts';
import { AuthPrismaRepository } from '../../infra/repository/repository.ts';
import { cookieTokenSchema } from '../schemas/schemas';

const authenticate = authenticateClientFactory({
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});

export const AuthPlugin = new Elysia().use(SetupPlugin).guard({
	as: 'scoped',
	beforeHandle: async ({ cookie, store }) => {
		const authInitiatedAt = performance.now();
		try {
			const token = cookie.token.value;
			const client = await authenticate(token);

			store.clientRole = client.role;
			store.clientId = client.id;
		} finally {
			store.authTiming = Math.round(performance.now() - authInitiatedAt);
		}
	},
	response: {
		401: appErrorSchema,
	},
	cookie: cookieTokenSchema,
});
