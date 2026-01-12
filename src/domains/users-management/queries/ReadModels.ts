import type { userRole, userStatus } from '@prisma/generated/enums';
export type { ClientAuthCredentials } from '@GenericSubdomains/authentication/ports/AuthRepository';

export type FullUser = {
	id: number;
	email: string;
	name: string;
	nickname: string;
	bio: string | null;
	avatarUrl: string | null;

	role: userRole;
	status: userStatus;

	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	emailVerifiedAt: Date | null;
};

export type UserPreview = {
	id: string;
	nickname: string;
	avatarUrl: string | null;
	role: userRole;
};
