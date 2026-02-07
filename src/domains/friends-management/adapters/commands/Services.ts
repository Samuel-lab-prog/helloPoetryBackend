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
} from '../../use-cases/Models';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	rejectFriendRequestFactory,
	blockUserFactory,
	deleteFriendFactory,
	cancelFriendRequestFactory,
	unblockUserFactory,
	type SendFriendRequestParams,
	type AcceptFriendRequestParams,
	type RejectFriendRequestParams,
	type BlockUserParams,
	type DeleteFriendParams,
	type CancelFriendRequestParams,
	type UnblockUserParams,
} from '../../use-cases/commands/Index';

export interface CommandsRouterServices {
	sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord>;
	acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendshipRecord>;
	rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequestRejectionRecord>;
	blockUser(params: BlockUserParams): Promise<BlockedUserRecord>;
	deleteFriend(params: DeleteFriendParams): Promise<RemovedFriendRecord>;
	cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<CancelFriendRequestRecord>;
	unblockUser(params: UnblockUserParams): Promise<UnblockUserRecord>;
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
