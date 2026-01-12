import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { UserReadRepository } from '../../queries/ports/ReadRepository';
import type { FullUser } from '../../queries/read-models/FullUser';
import type { PublicProfile } from '../../queries/read-models/PublicProfile';
import type { ClientAuthCredentials } from '../../queries/read-models/ClientAuth';

const fullUserSelect = {
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

const userProfileSelect = {
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
		select: { id: true },
	},

	friendshipsTo: {
		where: { status: 'accepted' },
		select: { id: true },
	},
} as const;

const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
} as const satisfies Record<keyof ClientAuthCredentials, boolean>;

function selectUserById(id: number): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { id },
			select: fullUserSelect,
		});
	});
}

function selectUserByNickname(nickname: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { nickname },
			select: fullUserSelect,
		});
	});
}

function selectUserByEmail(email: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: fullUserSelect,
		});
	});
}

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: authUserSelect,
		});
	});
}

function selectUserProfileById(
	id: number,
	requesterId?: number,
): Promise<PublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: userProfileSelect,
		});

		if (!user) return null;

		let friendship: PublicProfile['friendship'] | undefined;

		if (requesterId && requesterId !== user.id) {
			const relation = await prisma.friendship.findFirst({
				where: {
					OR: [
						{ userAId: requesterId, userBId: user.id },
						{ userAId: user.id, userBId: requesterId },
					],
				},
			});

			friendship = relation
				? {
						status: relation.status,
						isRequester: relation.userAId === requesterId,
					}
				: {
						status: 'none',
						isRequester: false,
					};
		}

		const profile: PublicProfile = {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio ?? undefined,
			avatarUrl: user.avatarUrl ?? undefined,
			role: user.role,
			status: user.status,

			stats: {
				poemsCount: user.poems.length,
				commentsCount: user.comments.length,
				friendsCount: user.friendshipsFrom.length + user.friendshipsTo.length,
			},

			friendship,
		};

		return profile;
	});
}

export const QueriesRepository: UserReadRepository = {
	selectUserById,
	selectUserByNickname,
	selectUserByEmail,
	selectAuthUserByEmail,
	selectUserProfileById,
};
