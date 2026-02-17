import type {
	TokenService,
	TokenPayload,
	LoginClientParams,
} from '../../ports/Services';
import type { LoginResponse } from '../../ports/Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { UnauthorizedError } from '@DomainError';

export interface LoginClientDependencies {
	tokenService: TokenService;
	hashService: HashServices;
	usersContract: UsersPublicContract;
}

const TOKEN_EXPIRATION_TIME = 3600;
export function loginClientFactory(dependencies: LoginClientDependencies) {
	return async function loginClient(
		params: LoginClientParams,
	): Promise<LoginResponse> {
		const { tokenService, hashService, usersContract } = dependencies;
		const client = await usersContract.selectAuthUserByEmail(params.email);

		if (!client) throw new UnauthorizedError('Invalid credentials');
		if (client.status === 'banned')
			throw new UnauthorizedError('Client is banned');

		const isPasswordValid = await hashService.compare(
			params.password,
			client.passwordHash,
		);

		if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

		const tokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
		};

		const token = await tokenService.generateToken(
			tokenPayload,
			TOKEN_EXPIRATION_TIME,
		);
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
