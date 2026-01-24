import type { FriendRequest } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	rejectFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	createFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
	acceptFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
}
