import { mock } from 'bun:test';
import { type MockedContract, createMockedContract } from '@TestUtils';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	rejectFriendRequestFactory,
	cancelFriendRequestFactory,
	deleteFriendFactory,
	blockUserFactory,
	unblockUserFactory,
} from '../commands/Index';

export type FriendsManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
};

export function friendsManagementMockFactories(): FriendsManagementSutMocks {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createFriendRequest: mock(),
			rejectFriendRequest: mock(),
			acceptFriendRequest: mock(),
			cancelFriendRequest: mock(),
			blockUser: mock(),
			unblockUser: mock(),
			deleteFriend: mock(),
			deleteFriendRequestIfExists: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
		}),
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),
	};
}

type FriendsManagementDeps = FriendsManagementSutMocks;

export function friendsManagementFactory(deps: FriendsManagementDeps) {
	return {
		sendFriendRequest: sendFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		acceptFriendRequest: acceptFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		rejectFriendRequest: rejectFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		cancelFriendRequest: cancelFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		deleteFriend: deleteFriendFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		blockUser: blockUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		unblockUser: unblockUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
	};
}
