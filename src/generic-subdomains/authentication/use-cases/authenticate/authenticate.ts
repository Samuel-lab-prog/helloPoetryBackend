import type { TokenService } from '../../ports/TokenService';
import type { AuthRepository } from '../../ports/AuthRepository';

import { ClientNotFoundError, InvalidTokenError } from '../errors';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

interface Dependencies {
	tokenService: TokenService;
	findClientByEmail: AuthRepository['findClientByEmail'];
}

interface AuthClient {
	id: number;
	role: UserRole;
	status: UserStatus;
}

export function authenticateClientFactory(dependencies: Dependencies) {
	const { tokenService, findClientByEmail } = dependencies;
	return async function authenticateClient(token: string): Promise<AuthClient> {
		try {
			const payload = tokenService.verifyToken(token);
			if (!payload || !payload.email) {
				throw new InvalidTokenError();
			}
			const client = await findClientByEmail(payload.email);
			if (!client) {
				throw new ClientNotFoundError();
			}
			return {
				id: client.id,
				role: client.role as UserRole,
				status: client.status as UserStatus,
			};
		} catch {
			throw new InvalidTokenError();
		}
	};
}
