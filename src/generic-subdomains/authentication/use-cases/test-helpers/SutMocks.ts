import type { MockedContract } from '@TestUtils';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import type { TokenService } from '../../ports/Services';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export type AuthSutMocks = {
	usersContract: MockedContract<UsersPublicContract>;
	tokenService: MockedContract<TokenService>;
	hashService: MockedContract<HashServices>;
};
