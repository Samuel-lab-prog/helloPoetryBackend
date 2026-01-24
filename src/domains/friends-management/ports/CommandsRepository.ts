import type { FriendRequest } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	createFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
}
