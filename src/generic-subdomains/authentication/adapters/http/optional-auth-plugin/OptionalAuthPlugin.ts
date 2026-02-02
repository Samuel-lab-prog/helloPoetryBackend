import { Elysia } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';

import { authenticateClientFactory } from '../../../use-cases/authenticate/authenticate';
import { JwtTokenService } from '../../../infra/token/JwtTokenService';
import { AuthPrismaRepository } from '../../../infra/repository/repository';
import { cookieTokenSchema } from '../../schemas/cookieTokenSchema';

interface Dependencies {
	authenticate: (token: string) => Promise<{
		id: number;
		role: string;
		status: string;
	}>;
}

export function createOptionalAuthPlugin({ authenticate }: Dependencies) {
	return new Elysia()
		.use(SetupPlugin)

		.guard({
			cookie: cookieTokenSchema,
		})

		.derive(async ({ cookie, store }) => {
			const started = performance.now();

			try {
				const token = cookie.token?.value;

				if (!token) {
					return { auth: null };
				}

				const client = await authenticate(token);

				return {
					auth: {
						clientId: client.id,
						clientRole: client.role,
						clientStatus: client.status,
					},
				};
			} catch {
				return { auth: null };
			} finally {
				store.authTiming = Math.round(performance.now() - started);
			}
		});
}

const authenticate = authenticateClientFactory({
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});

export const OptionalAuthPlugin = createOptionalAuthPlugin({ authenticate });
