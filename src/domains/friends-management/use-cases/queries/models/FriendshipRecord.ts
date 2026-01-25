import type { FriendshipStatus } from './Enums';

export type FriendshipRecord = {
	userAId: number;
	userBId: number;
	status: FriendshipStatus;
};
