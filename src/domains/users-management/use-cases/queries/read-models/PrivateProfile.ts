import type { userRole, friendshipStatus, userStatus } from './Enums';

export type PrivateProfile = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
	role: userRole;
	status: userStatus;
	friendsIds: number[];
	email: string;
	emailVerifiedAt: Date | null;

	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
		poemsIds: number[];
	};

	friendshipRequests: {
		status: friendshipStatus;
		isRequester: boolean;
		userId: number;
	}[];
};
