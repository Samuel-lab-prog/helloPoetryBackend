import type { UserRole, UserStatus } from './Enums';
import type { FriendshipStatus } from '@SharedKernel/Enums';

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

	friendship?: {
		status: FriendshipStatus;
		isRequester: boolean;
	};
};
