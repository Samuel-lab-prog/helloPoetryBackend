import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import { createAuthPlugin } from './adapters/auth-plugin';
import { createAuthRouter } from './adapters/auth-router';
import {
	FakeJwtTokenService,
	JwtTokenService,
} from './infra/jwt-token-service/jwt-token-service';
import { authenticateClientFactory } from './use-cases/commands/authenticate/execute';
import { loginClientFactory } from './use-cases/commands/login/execute';
import { refreshSessionFactory } from './use-cases/commands/refresh/execute';

const login = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
});

const loginWithFakeHash = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: FakeHashService,
	tokenService: JwtTokenService,
});

const authenticate = authenticateClientFactory({
	usersContract: usersPublicContract,
	tokenService: JwtTokenService,
});

const refreshSession = refreshSessionFactory({
	usersContract: usersPublicContract,
	tokenService: JwtTokenService,
});

export const authRouter = createAuthRouter({ login, refreshSession });
export const authRouterWithFakeHash = createAuthRouter({
	login: loginWithFakeHash,
	refreshSession,
});
export const authPlugin = createAuthPlugin({ authenticate });

export const authPluginWithFakeTokenService = createAuthPlugin({
	authenticate: authenticateClientFactory({
		usersContract: usersPublicContract,
		tokenService: FakeJwtTokenService,
	}),
});
