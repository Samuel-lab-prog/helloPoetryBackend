import { createFriendsCommandsRouter } from './adapters/CommandsRouter';
import { type CommandsRouterServices } from './ports/Commands';
import {
	cancelFriendRequestFactory,
	rejectFriendRequestFactory,
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	blockUserFactory,
	deleteFriendFactory,
	unblockUserFactory,
} from './use-cases/commands/Index';

import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';
import { usersContractForInteractions } from '@SharedKernel/contracts/users/Index';
import { friendsContractForInteractions } from '@SharedKernel/contracts/friends/Index';

export const commandsRouterServices: CommandsRouterServices = {
	cancelFriendRequest: cancelFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	rejectFriendRequest: rejectFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	sendFriendRequest: sendFriendRequestFactory({
		commandsRepository,
		usersContract: usersContractForInteractions,
		friendsContract: friendsContractForInteractions,
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
		usersContract: usersContractForInteractions,
		friendsContract: friendsContractForInteractions,
	}),
	blockUser: blockUserFactory({
		commandsRepository,
		usersContract: usersContractForInteractions,
		friendsContract: friendsContractForInteractions,
	}),
	deleteFriend: deleteFriendFactory({
		commandsRepository,
		usersContract: usersContractForInteractions,
		friendsContract: friendsContractForInteractions,
	}),
	unblockUser: unblockUserFactory({
		commandsRepository,
		queriesRepository,
	}),
};

export const friendsCommandsRouter =
	createFriendsCommandsRouter(commandsRouterServices);
