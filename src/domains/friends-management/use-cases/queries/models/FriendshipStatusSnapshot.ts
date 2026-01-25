export type FriendshipStatusSnapshot = {
	exists: boolean;
	status: string;
	requesterId: number;
	canSendRequest: boolean;
	canAcceptRequest: boolean;
	canRemoveFriend: boolean;
};
