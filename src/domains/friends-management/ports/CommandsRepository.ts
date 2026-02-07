import type {
	FriendshipRecord,
	FriendRequestRecord,
	CancelFriendRequestRecord,
	FriendRequestRejectionRecord,
	UnblockUserRecord,
	BlockedUserRecord,
	RemovedFriendRecord,
} from '../use-cases/Models';

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
