/* eslint-disable max-lines */
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import { canViewPoem } from '../use-cases/policies/Policies';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export type UserProfilePoem = {
	id: number;
	title: string;
	slug: string;
	createdAt: Date;
	likesCount: number;
	commentsCount: number;
	tags: Array<{
		id: number;
		name: string;
	}>;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string | null;
	};
};

export type UserPrivateProfileView = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: UserRole;
	status: UserStatus;
	email: string;
	emailVerifiedAt: Date | null;
	unreadNotificationsCount: number;
	poems: UserProfilePoem[];
	stats: {
		poems: Array<{ id: number; title: string }>;
		commentsIds: number[];
		friends: Array<{ id: number }>;
	};
	blockedUsersIds: number[];
};

export type UserPublicProfileView = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: UserRole;
	status: UserStatus;
	poems: UserProfilePoem[];
	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};
	isFriend: boolean;
	hasBlockedRequester: boolean;
	isBlockedByRequester: boolean;
	isFriendRequester: boolean;
	hasIncomingFriendRequest: boolean;
};

export type ProfileViewer = {
	id?: number;
	role?: string;
	status?: string;
};

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
	notifications: {
		where: { readAt: null },
		select: { id: true },
	},

	poems: {
		where: { deletedAt: null },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			status: true,
			visibility: true,
			moderationStatus: true,
			_count: {
				select: {
					poemLikes: true,
					comments: true,
				},
			},
			tags: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
	comments: { select: { id: true } },
	friendshipsFrom: {
		select: { userBId: true },
	},

	friendshipsTo: {
		select: { userAId: true },
	},

	blockedUsers: { select: { blockedId: true } },
} as const satisfies UserSelect;

type PrivateProfileRaw = Prisma.UserGetPayload<{
	select: typeof privateProfileSelect;
}>;

export function fromRawToPrivateProfile(
	raw: PrivateProfileRaw,
	viewer: ProfileViewer,
): UserPrivateProfileView {
	const friendsSet = new Set<number>();

	for (const friendship of raw.friendshipsFrom) {
		friendsSet.add(friendship.userBId);
	}

	for (const friendship of raw.friendshipsTo) {
		friendsSet.add(friendship.userAId);
	}

	const friends = Array.from(friendsSet.values()).map((id) => ({ id }));
	const visiblePoems = raw.poems.filter((poem) =>
		canViewPoem({
			viewer: {
				id: viewer.id,
				role: viewer.role as UserRole,
				status: viewer.status as UserStatus,
			},
			author: { id: raw.id, friendIds: friends.map((f) => f.id) },
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
			},
		}),
	);

	const stats = {
		poems: visiblePoems.map((poem) => ({
			id: poem.id,
			title: poem.title,
		})),
		commentsIds: raw.comments.map((comment) => comment.id),
		friends,
	};

	const blockedUserIds = raw.blockedUsers.map((b) => b.blockedId);

	return {
		id: raw.id,
		nickname: raw.nickname,
		name: raw.name,
		bio: raw.bio,
		avatarUrl: raw.avatarUrl,
		role: raw.role,
		status: raw.status,
		email: raw.email,
		emailVerifiedAt: raw.emailVerifiedAt,
		unreadNotificationsCount: raw.notifications.length,
		poems: visiblePoems.map((poem) => ({
			id: poem.id,
			title: poem.title,
			slug: poem.slug,
			createdAt: poem.createdAt,
			likesCount: poem._count.poemLikes,
			commentsCount: poem._count.comments,
			tags: poem.tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
			})),
			author: {
				id: raw.id,
				name: raw.name,
				nickname: raw.nickname,
				avatarUrl: raw.avatarUrl,
			},
		})),
		stats,
		blockedUsersIds: blockedUserIds,
	};
}

export const publicProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,

	poems: {
		where: { deletedAt: null },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			status: true,
			visibility: true,
			moderationStatus: true,
			_count: {
				select: {
					poemLikes: true,
					comments: true,
				},
			},
			tags: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
	comments: { select: { id: true } },

	friendshipsFrom: { select: { userBId: true } },
	friendshipsTo: { select: { userAId: true } },

	blockedUsers: { select: { blockedId: true } },
	blockedBy: { select: { blockerId: true } },
} as const satisfies UserSelect;

export type PublicProfileRaw = Prisma.UserGetPayload<{
	select: typeof publicProfileSelect;
}>;

export function fromRawToPublicProfile(
	raw: PublicProfileRaw,
	viewer: ProfileViewer,
): UserPublicProfileView {
	const friendIds = [
		...raw.friendshipsFrom.map((f) => f.userBId),
		...raw.friendshipsTo.map((f) => f.userAId),
	];

	const visiblePoems = raw.poems.filter((poem) =>
		canViewPoem({
			viewer: {
				id: viewer.id,
				role: viewer.role as UserRole,
				status: viewer.status as UserStatus,
			},
			author: { id: raw.id, friendIds },
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
			},
		}),
	);

	return {
		id: raw.id,
		nickname: raw.nickname,
		name: raw.name,
		bio: raw.bio,
		avatarUrl: raw.avatarUrl,
		role: raw.role,
		status: raw.status,
		poems: visiblePoems.map((poem) => ({
			id: poem.id,
			title: poem.title,
			slug: poem.slug,
			createdAt: poem.createdAt,
			likesCount: poem._count.poemLikes,
			commentsCount: poem._count.comments,
			tags: poem.tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
			})),
			author: {
				id: raw.id,
				name: raw.name,
				nickname: raw.nickname,
				avatarUrl: raw.avatarUrl,
			},
		})),

		stats: {
			poemsCount: visiblePoems.length,
			commentsCount: raw.comments.length,
			friendsCount: friendIds.length,
		},

		isFriend: viewer.id !== undefined ? friendIds.includes(viewer.id) : false,

		hasBlockedRequester:
			viewer.id !== undefined
				? raw.blockedUsers.some((b) => b.blockedId === viewer.id)
				: false,

		isBlockedByRequester:
			viewer.id !== undefined
				? raw.blockedBy.some((b) => b.blockerId === viewer.id)
				: false,

		isFriendRequester: viewer.id !== undefined ? raw.id === viewer.id : false,
		hasIncomingFriendRequest: false,
	};
}
