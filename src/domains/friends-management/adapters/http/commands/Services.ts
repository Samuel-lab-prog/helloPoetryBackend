import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type { FriendRequest } from '../../../use-cases/commands/models/Index';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	rejectFriendRequestFactory,
	blockFriendRequestFactory,
	deleteFriendFactory,
	cancelFriendRequestFactory,
	unblockFriendRequestFactory,
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
	cancelFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	unblockFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
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
	cancelFriendRequest: cancelFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	unblockFriendRequest: unblockFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
};
