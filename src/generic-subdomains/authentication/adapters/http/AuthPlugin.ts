import Elysia from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { throwUnprocessableEntityError } from '@AppError';
import { authenticateClientFactory } from '../../use-cases/authenticate/authenticate.ts';
import { JwtTokenService } from '../../infra/token/JwtTokenService.ts';
import { AuthPrismaRepository } from '../../infra/repository/repository.ts';

const authenticate = authenticateClientFactory({
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});

export const AuthPlugin = new Elysia()
	.use(SetupPlugin)
	.onBeforeHandle({ as: 'scoped' }, async ({ cookie, store }) => {
		const authInitiatedAt = performance.now();

		try {
			const token = cookie.token?.value;
			if (!token || typeof token !== 'string') {
				throwUnprocessableEntityError('No token provided');
			}

			const client = await authenticate(token);

			store.clientRole = client.role as 'user' | 'author' | 'moderator';
			store.clientId = client.id;
		} finally {
			store.authTiming = Math.round(performance.now() - authInitiatedAt);
		}
	});
