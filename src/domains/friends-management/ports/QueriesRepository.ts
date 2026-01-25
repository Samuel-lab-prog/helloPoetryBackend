import type { FriendshipRecord } from '../use-cases/queries/models/Index';

export interface QueriesRepository {
	findFriendshipBetweenUsers(params: {
		userAId: number;
		userBId: number;
	}): Promise<FriendshipRecord | null>;
}
