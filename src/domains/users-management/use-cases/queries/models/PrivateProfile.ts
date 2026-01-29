import type { UserRole, UserStatus } from './Enums';

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
		commentsIds: number[];
		friendsIds: number[];
		poemsIds: number[];
	};

	friendshipRequestsSent: {
		addresseeId: number;
		addresseeNickname: string;
		addresseeAvatarUrl: string | null;
	}[];

	friendshipRequestsReceived: {
		requesterId: number;
		requesterNickname: string;
		requesterAvatarUrl: string | null;
	}[];
};
