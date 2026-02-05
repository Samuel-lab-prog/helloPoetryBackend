import type { UserPublicProfile } from '../../../use-cases/Models';
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';

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

	blockedUsers: { select: { blockedId: true } },
	blockedBy: { select: { blockerId: true } },
} as const satisfies UserSelect;

export type PublicProfileRaw = Prisma.UserGetPayload<{
	select: typeof publicProfileSelect;
}>;

export function fromRawToPublicProfile(
	raw: PublicProfileRaw,
	requesterId: number,
): UserPublicProfile {
	const friendIds = [
		...raw.friendshipsFrom.map((f) => f.userBId),
		...raw.friendshipsTo.map((f) => f.userAId),
	];

	return {
		id: raw.id,
		nickname: raw.nickname,
		name: raw.name,
		bio: raw.bio,
		avatarUrl: raw.avatarUrl,
		role: raw.role,
		status: raw.status,

		stats: {
			poemsCount: raw.poems.length,
			commentsCount: raw.comments.length,
			friendsCount: friendIds.length,
		},

		isFriend: friendIds.includes(requesterId),

		hasBlockedRequester: raw.blockedUsers.some(
			(b) => b.blockedId === requesterId,
		),

		isBlockedByRequester: raw.blockedBy.some(
			(b) => b.blockerId === requesterId,
		),

		isFriendRequester: raw.id === requesterId,
	};
}
