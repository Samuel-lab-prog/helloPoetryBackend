import type { TokenService, TokenPayload } from '../../ports/TokenService';
import type { HashService } from '../../ports/HashService';
import type { AuthRepository } from '../../ports/AuthRepository';

import { InvalidCredentialsError } from '../errors';

interface Dependencies {
	tokenService: TokenService;
	hashService: HashService;
	findClientByEmail: AuthRepository['findClientByEmail'];
}

interface AuthClient {
	id: number;
	role: string;
}

interface LoginResponse {
	token: string;
	client: AuthClient;
}

export function makeLoginClient(dependencies: Dependencies) {
	return async function loginClient(
		clientEmail: string,
		clientPassword: string,
	): Promise<LoginResponse> {
		const { tokenService, hashService, findClientByEmail } = dependencies;
		const client = await findClientByEmail(clientEmail);

		if (!client) {
			throw new InvalidCredentialsError();
		}

		const isPasswordValid = await hashService.compare(
			clientPassword,
			client.passwordHash,
		);

		if (!isPasswordValid) {
			throw new InvalidCredentialsError();
		}

		const tokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
		};

		const token = tokenService.generateToken(tokenPayload, 60 * 60 * 1000);
		return {
			token,
			client: {
				id: client.id,
				role: client.role,
			},
		};
	};
}
