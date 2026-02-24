import { mock } from 'bun:test';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { TokenService, LoginClientParams } from '../../ports/Services';
import type { HashServices } from '@SharedKernel/ports/HashServices';

import {
	createMockedContract,
	makeParams,
	makeSut,
} from '@GenericSubdomains/utils/testUtils';

import {
	givenAuthUserExists,
	givenAuthUserNotFound,
	givenPasswordValid,
	givenTokenGenerated,
	givenTokenValid,
	givenTokenInvalid,
	type AuthUserOverride,
} from './Givens';

import { loginClientFactory } from '../login/execute';

import {
	DEFAULT_CLIENT_EMAIL,
	DEFAULT_PASSWORD,
	DEFAULT_TOKEN,
} from './Constants';

import type { AuthSutMocks } from './SutMocks';
import { authenticateClientFactory } from '../authenticate/execute';

function makeAuthMockFactories() {
	return {
		usersContract: createMockedContract<UsersPublicContract>({
			selectAuthUserByEmail: mock(),
			selectUserBasicInfo: mock(),
		}),

		hashService: createMockedContract<HashServices>({
			compare: mock(),
			hash: mock(),
		}),

		tokenService: createMockedContract<TokenService>({
			generateToken: mock(),
			verifyToken: mock(),
		}),
	};
}

function authFactory(deps: ReturnType<typeof makeAuthMockFactories>) {
	return {
		login: loginClientFactory(deps),
		authenticateClient: authenticateClientFactory(deps),
	};
}

export function makeAuthScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		authFactory,
		makeAuthMockFactories(),
	);

	return {
		withAuthUser(overrides: AuthUserOverride = {}) {
			givenAuthUserExists(mocks.usersContract, overrides);
			return this;
		},

		withAuthUserNotFound() {
			givenAuthUserNotFound(mocks.usersContract);
			return this;
		},

		withPasswordValid(isValid = true) {
			givenPasswordValid(mocks.hashService, isValid);
			return this;
		},

		withTokenGenerated(token: string = DEFAULT_TOKEN) {
			givenTokenGenerated(mocks.tokenService, token);
			return this;
		},

		withTokenValid(
			overrides: Partial<ReturnType<TokenService['verifyToken']>> = {},
		) {
			givenTokenValid(mocks.tokenService, overrides);
			return this;
		},

		withTokenInvalid() {
			givenTokenInvalid(mocks.tokenService);
			return this;
		},

		executeLogin(params: Partial<LoginClientParams> = {}) {
			return sutFactory.login(
				makeParams(
					{
						email: DEFAULT_CLIENT_EMAIL,
						password: DEFAULT_PASSWORD,
					},
					params,
				),
			);
		},

		executeAuthenticate(token: string = DEFAULT_TOKEN) {
			return sutFactory.authenticateClient(token);
		},

		get mocks(): AuthSutMocks {
			return mocks;
		},
	};
}
