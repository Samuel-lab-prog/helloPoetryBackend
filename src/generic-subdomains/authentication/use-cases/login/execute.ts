import type { TokenService, TokenPayload } from '../../ports/Services';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { UnauthorizedError } from '@DomainError';

import type { LoginResponse } from '../../ports/Models';
import type { HashServices } from '@SharedKernel/ports/HashServices';

interface Dependencies {
	tokenService: TokenService;
	hashService: HashServices;
	findClientByEmail: UsersPublicContract['selectAuthUserByEmail'];
}

export function loginClientFactory(dependencies: Dependencies) {
	return async function loginClient(
		clientEmail: string,
		clientPassword: string,
	): Promise<LoginResponse> {
		const { tokenService, hashService, findClientByEmail } = dependencies;
		const client = await findClientByEmail(clientEmail);

		if (!client) throw new UnauthorizedError('Invalid credentials');

		const isPasswordValid = await hashService.compare(
			clientPassword,
			client.passwordHash,
		);

		if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

		const tokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
		};

		const token = tokenService.generateToken(tokenPayload, 3600);
		return {
			token,
			client: {
				id: client.id,
				role: client.role,
				status: client.status,
			},
		};
	};
}
