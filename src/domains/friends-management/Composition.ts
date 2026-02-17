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
import { usersPublicContract } from '@Domains/users-management/public/Index';

const commandsServices: CommandsRouterServices = {
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
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	blockUser: blockUserFactory({
		commandsRepository,
		queriesRepository,
	}),
	deleteFriend: deleteFriendFactory({
		commandsRepository,
		queriesRepository,
	}),
	unblockUser: unblockUserFactory({
		commandsRepository,
		queriesRepository,
	}),
};

export const friendsCommandsRouter =
	createFriendsCommandsRouter(commandsServices);
