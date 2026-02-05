import type { PrivateProfile } from '@Domains/users-management/use-cases/queries/Index';
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

	poems: { select: { id: true } },
	comments: { select: { id: true } },

	friendshipsFrom: {
		select: { userBId: true },
	},

	friendshipsTo: {
		select: { userAId: true },
	},

	friendshipRequests: {
		select: {
			addresseeId: true,
			addressee: {
				select: {
					nickname: true,
					avatarUrl: true,
				},
			},
		},
	},

	blockedUsers: { select: { blockedId: true } },

	friendshipAddressees: {
		select: {
			requesterId: true,
			requester: {
				select: {
					nickname: true,
					avatarUrl: true,
				},
			},
		},
	},
} as const satisfies UserSelect;

type PrivateProfileRaw = Prisma.UserGetPayload<{
	select: typeof privateProfileSelect;
}>;

export function fromRawToPrivateProfile(
	raw: PrivateProfileRaw,
): PrivateProfile {
	const friendIds = [
		...raw.friendshipsFrom.map((f) => f.userBId),
		...raw.friendshipsTo.map((f) => f.userAId),
	];
	const stats = {
		poemsIds: raw.poems.map((p) => p.id),
		commentsIds: raw.comments.map((c) => c.id),
		friendsIds: friendIds,
	};

	const friendshipRequestsSent = raw.friendshipRequests.map((r) => ({
		addresseeId: r.addresseeId,
		addresseeNickname: r.addressee.nickname,
		addresseeAvatarUrl: r.addressee.avatarUrl,
	}));

	const friendshipRequestsReceived = raw.friendshipAddressees.map((r) => ({
		requesterId: r.requesterId,
		requesterNickname: r.requester.nickname,
		requesterAvatarUrl: r.requester.avatarUrl,
	}));

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
		friendsIds: friendIds,
		stats,
		friendshipRequestsSent,
		friendshipRequestsReceived,
		blockedUsersIds: blockedUserIds,
	};
}
