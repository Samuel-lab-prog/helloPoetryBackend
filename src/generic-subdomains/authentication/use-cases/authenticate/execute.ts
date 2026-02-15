import type { TokenService } from '../../ports/TokenService';
import { ClientNotFoundError, InvalidTokenError } from '../Errors';
import type { AuthClient } from '../Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

interface Dependencies {
	tokenService: TokenService;
	findClientByEmail: UsersPublicContract['selectAuthUserByEmail'];
}

export function authenticateClientFactory(dependencies: Dependencies) {
	const { tokenService, findClientByEmail } = dependencies;
	return async function authenticateClient(token: string): Promise<AuthClient> {
		const payload = tokenService.verifyToken(token);
		if (!payload || !payload.email) throw new InvalidTokenError();

		const client = await findClientByEmail(payload.email);
		if (!client) throw new ClientNotFoundError();

		return {
			id: client.id,
			role: client.role,
			status: client.status,
		};
	};
}
