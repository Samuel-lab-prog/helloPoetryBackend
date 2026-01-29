import type {
	FriendRequestRecord,
	BlockedFriendRecord,
	FriendshipRecord,
} from '../use-cases/queries/models/Index';

export interface QueriesRepository {
	findFriendshipBetweenUsers(params: {
		user1Id: number;
		user2Id: number;
	}): Promise<FriendshipRecord | null>;

	findFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequestRecord | null>;
	findBlockedRelationship(
		userId1: number,
		userId2: number,
	): Promise<BlockedFriendRecord | null>;
}
