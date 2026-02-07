import type {
	FriendRequestRecord,
	BlockedUserRecord,
	FriendshipRecord,
} from '../use-cases/Models';

export interface QueriesRepository {
	findFriendshipBetweenUsers(params: {
		user1Id: number;
		user2Id: number;
	}): Promise<FriendshipRecord | null>;
	findFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequestRecord | null>;
	findBlockedRelationship(params: {
		userId1: number;
		userId2: number;
	}): Promise<BlockedUserRecord | null>;
}
