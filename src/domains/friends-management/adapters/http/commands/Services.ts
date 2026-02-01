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
		addresseeId: number;
	}): Promise<FriendRequest>;
	acceptFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	rejectFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	blockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	deleteFriend(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<{ requesterId: number; addresseeId: number }>;
	cancelFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	unblockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
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
