import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type { FriendRequest } from '../../../use-cases/commands/models/Index';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	rejectFriendRequestFactory,
	blockFriendRequestFactory,
	deleteFriendFactory,
} from '../../../use-cases/commands/Index';

export interface CommandsRouterServices {
	sendFriendRequest(params: {
		requesterId: number;
		targetUserId: number;
	}): Promise<FriendRequest>;
	acceptFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	rejectFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	blockFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	deleteFriend(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<{ fromUserId: number; toUserId: number }>;
}

export const commandsRouterServices: CommandsRouterServices = {
	sendFriendRequest: sendFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	rejectFriendRequest: rejectFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	blockFriendRequest: blockFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	deleteFriend: deleteFriendFactory({
		commandsRepository,
		queriesRepository,
	}),
};
