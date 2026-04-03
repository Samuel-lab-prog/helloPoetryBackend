import type { UserPrivateProfile } from '../../..//use-cases/Models';
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import { canViewPoem } from '@Domains/poems-management/use-cases/Policies';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

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
	viewer: { id?: number; role?: string; status?: string },
): UserPrivateProfile {
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
