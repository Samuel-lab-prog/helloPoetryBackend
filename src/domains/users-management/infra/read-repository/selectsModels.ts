import type { UserAuthCredentials } from '../../use-cases/queries/models/Index';

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

	poems: { select: { id: true } },
	comments: { select: { id: true } },

	friendshipsFrom: { select: { userBId: true } },
	friendshipsTo: { select: { userAId: true } },
	blockedFriends: { select: { blockedId: true } },
	blockedBy: { select: { blockerId: true } },
} as const;

export const privateProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,
	email: true,
	emailVerifiedAt: true,

	poems: { select: { id: true } },
	comments: { select: { id: true } },

	friendshipsFrom: { select: { userBId: true } },
	friendshipsTo: { select: { userAId: true } },

	friendshipRequests: {
		select: {
			requesterId: true,
			addresseeId: true,
			requester: { select: { nickname: true, avatarUrl: true } },
			addressee: { select: { nickname: true, avatarUrl: true } },
		},
	},
} as const;

export const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
	status: true,
} as const satisfies Record<keyof UserAuthCredentials, boolean>;

export const previewUserSelect = {
	id: true,
	nickname: true,
	avatarUrl: true,
	role: true,
} as const;
