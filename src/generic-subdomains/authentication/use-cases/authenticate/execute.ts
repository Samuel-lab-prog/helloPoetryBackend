import type { TokenService } from '../../ports/Services';
import { UnprocessableEntityError, UnauthorizedError } from '@DomainError';
import type { AuthClient } from '../../ports/Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface AuthenticateClientDependencies {
	tokenService: TokenService;
	findClientByEmail: UsersPublicContract['selectAuthUserByEmail'];
}

export function authenticateClientFactory(dependencies: AuthenticateClientDependencies) {
	const { tokenService, findClientByEmail } = dependencies;
	return async function authenticateClient(token: string): Promise<AuthClient> {
		const payload = tokenService.verifyToken(token);
		if (!payload || !payload.email) throw new UnprocessableEntityError('Invalid token');

		const client = await findClientByEmail(payload.email);
		if (!client) throw new UnauthorizedError('Client not found');

		return {
			id: client.id,
			role: client.role,
			status: client.status,
		};
	};
}
