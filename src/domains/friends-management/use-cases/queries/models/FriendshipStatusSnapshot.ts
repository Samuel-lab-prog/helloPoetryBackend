import type { FriendshipStatus } from './Enums';

export type FriendshipStatusSnapshot = {
	exists: boolean;
	status: FriendshipStatus | 'none';
	requesterId: number;
	canSendRequest: boolean;
	canAcceptRequest: boolean;
	canRemoveFriend: boolean;
};
