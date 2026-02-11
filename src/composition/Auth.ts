import { createAuthRouter } from '@GenericSubdomains/authentication/adapters/http/auth-router/AuthRouter';
import { authRepository } from '@GenericSubdomains/authentication/infra/repository/Repository';
import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import { authenticateClientFactory } from '@GenericSubdomains/authentication/use-cases/authenticate/execute';
import { loginClientFactory } from '@GenericSubdomains/authentication/use-cases/login/execute';
import {
	JwtTokenService,
	FakeJwtTokenService,
} from '@GenericSubdomains/authentication/infra/token/JwtTokenService';
import { createAuthPlugin } from '@GenericSubdomains/authentication/adapters/http/auth-plugin/AuthPlugin';

const login = loginClientFactory({
	findClientByEmail: authRepository.findClientByEmail,
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
});

const authenticate = authenticateClientFactory({
	findClientByEmail: authRepository.findClientByEmail,
	tokenService: JwtTokenService,
});

const loginWithFakeHash = loginClientFactory({
	findClientByEmail: authRepository.findClientByEmail,
	hashService: FakeHashService,
	tokenService: JwtTokenService,
});

const authenticateWithFakeTokenService = authenticateClientFactory({
	findClientByEmail: authRepository.findClientByEmail,
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
