import type {
	FriendshipRecord,
	FriendRequestRecord,
	CancelFriendRequestRecord,
	FriendRequestRejectionRecord,
	UnblockUserRecord,
	BlockedUserRecord,
	RemovedFriendRecord,
} from '../use-cases/Models';

export type AcceptFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type BlockUserParams = {
	requesterId: number;
	addresseeId: number;
};

export type CancelFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type DeleteFriendParams = {
	requesterId: number;
	addresseeId: number;
};

export type RejectFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type SendFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type UnblockUserParams = {
	requesterId: number;
	addresseeId: number;
};

export interface CommandsRepository {
	createFriendRequest(
		requesterId: number,
		addresseeId: number,
	): Promise<FriendRequestRecord>;

	rejectFriendRequest(
		rejecterId: number,
		rejectedId: number,
	): Promise<FriendRequestRejectionRecord>;

	acceptFriendRequest(
		accepterId: number,
		accepteeId: number,
	): Promise<FriendshipRecord>;

	cancelFriendRequest(
		cancellerId: number,
		cancelledId: number,
	): Promise<CancelFriendRequestRecord>;

	blockUser(blockerId: number, blockedId: number): Promise<BlockedUserRecord>;

	unblockUser(
		unblockerId: number,
		unblockedId: number,
	): Promise<UnblockUserRecord>;

	deleteFriend(user1Id: number, user2Id: number): Promise<RemovedFriendRecord>;

	deleteFriendRequestIfExists(
		requesterId: number,
		addresseeId: number,
	): Promise<void>;
}

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
