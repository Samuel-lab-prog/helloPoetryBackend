import type { UserPublicProfile, UserStatus } from '../../../use-cases/Models';
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import { canViewPoem } from '@Domains/poems-management/use-cases/Policies';
import type { UserRole } from '@SharedKernel/Enums';

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
	viewer: { id?: number; role?: string; status?: string },
): UserPublicProfile {
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
