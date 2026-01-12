import type { userRole, userStatus } from './Enums';

export type FullUser = {
	id: number;
	email: string;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl: string;

	role: userRole;
	status: userStatus;

	createdAt: Date;
	updatedAt: Date;
	emailVerifiedAt: Date | null;
};
