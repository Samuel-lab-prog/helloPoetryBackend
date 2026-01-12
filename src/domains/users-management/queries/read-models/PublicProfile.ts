import type { userRole, friendshipStatus, userStatus } from './Enums';

export type PublicProfile = {
	id: number;
	nickname: string;
	name: string;
	bio?: string;
	avatarUrl?: string;
	role: userRole;
	status: userStatus;

	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};

	friendship?: {
		status: friendshipStatus;
		isRequester: boolean;
	};
};
