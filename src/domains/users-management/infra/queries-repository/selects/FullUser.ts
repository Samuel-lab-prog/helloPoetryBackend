import type { UserSelect } from '@PrismaGenerated/models';

export const fullUserSelect = {
	id: true,
	nickname: true,
	email: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	createdAt: true,
	updatedAt: true,
	emailVerifiedAt: true,
	deletedAt: true,
	status: true,
} as const satisfies UserSelect;
