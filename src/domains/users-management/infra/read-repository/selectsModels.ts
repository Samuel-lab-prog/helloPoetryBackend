import type { ClientAuthCredentials } from '../../use-cases/queries/read-models/ClientAuth';

export const fullUserSelect = {
	id: true,
	nickname: true,
	email: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	emailVerifiedAt: true,
	friendshipsTo: {
		select: { userAId: true },
	},
	friendshipsFrom: {
		select: { userBId: true },
	},
} as const;

export const publicProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,

	poems: {
		where: {
			deletedAt: null,
		},
		select: { id: true },
	},

	comments: {
		select: { id: true },
	},

	friendshipsFrom: {
		select: { id: true, status: true },
	},

	friendshipsTo: {
		select: { id: true, status: true },
	},
} as const;

export const privateProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	email: true,
	emailVerifiedAt: true,
	avatarUrl: true,
	role: true,
	status: true,

	poems: {
		where: {
			deletedAt: null,
		},
		select: { id: true },
	},

	comments: {
		select: { id: true },
	},

	friendshipsFrom: {
		select: { id: true, status: true, userAId: true, userBId: true },
	},

	friendshipsTo: {
		select: { id: true, status: true, userAId: true, userBId: true },
	},
} as const;

export const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
	status: true,
} as const satisfies Record<keyof ClientAuthCredentials, boolean>;

export const previewUserSelect = {
	id: true,
	nickname: true,
	avatarUrl: true,
	role: true,
} as const;
