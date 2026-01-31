import type { UserRole, UserStatus } from './Enums';

export type FullUser = {
	id: number;
	email: string;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl: string;

	role: UserRole;
	status: UserStatus;

	createdAt: Date;
	updatedAt: Date;
	emailVerifiedAt: Date | null;
};
