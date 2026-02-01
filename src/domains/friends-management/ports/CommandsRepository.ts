import type { FriendRequest } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	rejectFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	createFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	acceptFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	blockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	deleteFriend(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<{ requesterId: number; addresseeId: number }>;
	cancelFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
	unblockFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequest>;
}
