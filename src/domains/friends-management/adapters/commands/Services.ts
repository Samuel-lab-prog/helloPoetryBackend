import { commandsRepository } from '../../infra/commands-repository/Repository';
import { queriesRepository } from '../../infra/queries-repository/Repository';
import type {
	FriendRequestRecord,
	FriendshipRecord,
	FriendRequestRejectionRecord,
	BlockedUserRecord,
	RemovedFriendRecord,
	CancelFriendRequestRecord,
	UnblockUserRecord,
} from '../../use-cases/models/Index';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	rejectFriendRequestFactory,
	blockUserFactory,
	deleteFriendFactory,
	cancelFriendRequestFactory,
	unblockUserFactory,
} from '../../use-cases/commands/Index';

export interface CommandsRouterServices {
	sendFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequestRecord | FriendshipRecord>;
	acceptFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendshipRecord>;
	rejectFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequestRejectionRecord>;
	blockUser(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<BlockedUserRecord>;
	deleteFriend(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<RemovedFriendRecord>;
	cancelFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<CancelFriendRequestRecord>;
	unblockUser(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<UnblockUserRecord>;
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
	blockUser: blockUserFactory({
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
	unblockUser: unblockUserFactory({
		commandsRepository,
		queriesRepository,
	}),
};
