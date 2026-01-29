import type { UserRole, UserStatus } from './Enums';

export type PublicProfile = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
	role: UserRole;
	status: UserStatus;

	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};

	isFriend: boolean;
	isBlocked: boolean;
	isRequester?: boolean;
};
