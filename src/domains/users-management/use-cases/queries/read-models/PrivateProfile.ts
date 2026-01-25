import type { UserRole, UserStatus } from './Enums';
import type { FriendshipStatus } from '@SharedKernel/Enums';

export type PrivateProfile = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
	role: UserRole;
	status: UserStatus;
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
		status: FriendshipStatus;
		isRequester: boolean;
		userId: number;
	}[];
};
