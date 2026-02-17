import { createAuthRouter } from './adapters/AuthRouter';
import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import { authenticateClientFactory } from './use-cases/authenticate/execute';
import { loginClientFactory } from './use-cases/login/execute';
import { JwtTokenService, FakeJwtTokenService } from './infra/JwtTokenService';
import { createAuthPlugin } from './adapters/AuthPlugin';
import { usersPublicContract } from '@Domains/users-management/public/Index';

const login = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
});

const authenticate = authenticateClientFactory({
	usersContract: usersPublicContract,
	tokenService: JwtTokenService,
});

const loginWithFakeHash = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: FakeHashService,
	tokenService: JwtTokenService,
});

const authenticateWithFakeTokenService = authenticateClientFactory({
	usersContract: usersPublicContract,
	tokenService: FakeJwtTokenService,
});

export const authRouter = createAuthRouter({ login });
export const AuthPlugin = createAuthPlugin({ authenticate });
export const authRouterWithFakeHash = createAuthRouter({
	login: loginWithFakeHash,
});
export const authPluginWithFakeTokenService = createAuthPlugin({
	authenticate: authenticateWithFakeTokenService,
});
