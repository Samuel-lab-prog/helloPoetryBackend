import type { ClientAuthCredentials } from '../../use-cases/queries/read-models/ClientAuth';
import type { FullUser } from '../../use-cases/queries/read-models/FullUser';

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
} as const satisfies Record<keyof FullUser, boolean>;

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
			status: 'published',
			deletedAt: null,
		},
		select: { id: true },
	},

	comments: {
		where: {
			status: 'visible',
		},
		select: { id: true },
	},

	friendshipsFrom: {
		where: { status: 'accepted' },
		select: { id: true, status: true },
	},

	friendshipsTo: {
		where: { status: 'accepted' },
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
			status: 'published',
			deletedAt: null,
		},
		select: { id: true },
	},

	comments: {
		where: {
			status: 'visible',
		},
		select: { id: true },
	},

	friendshipsFrom: {
		where: { status: 'accepted' },
		select: { id: true, status: true, userAId: true, userBId: true },
	},

	friendshipsTo: {
		where: { status: 'accepted' },
		select: { id: true, status: true, userAId: true, userBId: true },
	},
} as const;

export const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
} as const satisfies Record<keyof ClientAuthCredentials, boolean>;

export const previewUserSelect = {
	id: true,
	nickname: true,
	avatarUrl: true,
	role: true,
} as const;
