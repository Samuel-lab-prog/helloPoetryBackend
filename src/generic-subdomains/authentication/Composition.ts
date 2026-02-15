import { createAuthRouter } from './adapters/http/auth-router/AuthRouter';
import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import { authenticateClientFactory } from './use-cases/authenticate/execute';
import { loginClientFactory } from './use-cases/login/execute';
import {
	JwtTokenService,
	FakeJwtTokenService,
} from './infra/token/JwtTokenService';
import { createAuthPlugin } from './adapters/http/auth-plugin/AuthPlugin';
import { usersPublicContract } from '@Domains/users-management/public/Index';

const login = loginClientFactory({
	findClientByEmail: usersPublicContract.selectAuthUserByEmail,
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
});

const authenticate = authenticateClientFactory({
	findClientByEmail: usersPublicContract.selectAuthUserByEmail,
	tokenService: JwtTokenService,
});

const loginWithFakeHash = loginClientFactory({
	findClientByEmail: usersPublicContract.selectAuthUserByEmail,
	hashService: FakeHashService,
	tokenService: JwtTokenService,
});

const authenticateWithFakeTokenService = authenticateClientFactory({
	findClientByEmail: usersPublicContract.selectAuthUserByEmail,
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
