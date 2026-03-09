import type { UserPrivateProfile } from '../../..//use-cases/Models';
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';

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

	poems: { select: { id: true, title: true } },
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
): UserPrivateProfile {
	const friendsSet = new Set<number>();

	for (const friendship of raw.friendshipsFrom) {
		friendsSet.add(friendship.userBId);
	}

	for (const friendship of raw.friendshipsTo) {
		friendsSet.add(friendship.userAId);
	}

	const friends = Array.from(friendsSet.values()).map((id) => ({ id }));
	const stats = {
		poems: raw.poems.map((poem) => ({
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
		stats,
		blockedUsersIds: blockedUserIds,
	};
}
