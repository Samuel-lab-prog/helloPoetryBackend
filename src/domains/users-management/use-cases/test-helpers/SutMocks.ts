import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testUtils';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { createUserFactory } from '../commands/create/execute';
import { updateUserFactory } from '../commands/update/execute';
import { getProfileFactory } from '../queries/get-profile/execute';
import { getUsersFactory } from '../queries/search-users/execute';

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
			selectProfile: mock(),
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
		getProfile: getProfileFactory(deps),
		getUsers: getUsersFactory(deps),
	};
}
