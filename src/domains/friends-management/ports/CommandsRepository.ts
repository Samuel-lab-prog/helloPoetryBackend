import type { FriendRequest } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	createFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;

	rejectFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;

	acceptFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;

	cancelFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;

	blockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;

	unblockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	deleteFriend(params: { user1Id: number; user2Id: number }): Promise<void>;

	deleteFriendRequestIfExists(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<void>;
}
