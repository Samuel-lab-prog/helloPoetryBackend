import { type MockedContract, createMockedContract } from '@TestUtils';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { createUserFactory } from '../commands/create/execute';
import { updateUserFactory } from '../commands/update/execute';
import { getPrivateProfileFactory } from '../queries/get-private-profile/execute';
import { getPublicProfileFactory } from '../queries/get-public-profile/execute';
import { getUsersFactory } from '../queries/get-users/execute';

export type UsersManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	hashServices: MockedContract<HashServices>;
};

export function usersManagementMockFactories() {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		}),

		queriesRepository: createMockedContract<QueriesRepository>({
			selectUserById: mock(),
			selectUserByNickname: mock(),
			selectUserByEmail: mock(),
			selectAuthUserByEmail: mock(),
			selectPublicProfile: mock(),
			selectPrivateProfile: mock(),
			selectUsers: mock(),
		}),

		hashServices: createMockedContract<HashServices>({
			hash: mock(),
			compare: mock(),
		}),
	};
}

type UsersManagementDeps = ReturnType<typeof usersManagementMockFactories>;

export function usersManagementFactory(deps: UsersManagementDeps) {
	return {
		createUser: createUserFactory(deps),
		updateUser: updateUserFactory(deps),
		getPrivateProfile: getPrivateProfileFactory(deps),
		getPublicProfile: getPublicProfileFactory(deps),
		getUsers: getUsersFactory(deps),
	};
}
