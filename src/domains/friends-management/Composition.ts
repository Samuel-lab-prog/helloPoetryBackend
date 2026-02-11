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
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
		queriesRepository,
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
