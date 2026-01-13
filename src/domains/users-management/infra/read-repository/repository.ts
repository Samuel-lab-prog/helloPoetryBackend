import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { UserReadRepository } from '../../queries/ports/ReadRepository';
import type { FullUser } from '../../queries/read-models/FullUser';
import type { PublicProfile } from '../../queries/read-models/PublicProfile';
import type { ClientAuthCredentials } from '../../queries/read-models/ClientAuth';
import {
	authUserSelect,
	fullUserSelect,
	publicProfileSelect,
	privateProfileSelect,
} from './helpers';
import type { PrivateProfile } from '../../queries/read-models/PrivateProfile';

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

function selectPublicProfile(
	id: number,
	requesterId?: number,
): Promise<PublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: publicProfileSelect,
		});

		if (!user) return null;

		let friendship: PublicProfile['friendship'] = {
			status: 'none',
			isRequester: false,
		};

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
			bio: user.bio,
			avatarUrl: user.avatarUrl,
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

export function selectPrivateProfile(
	id: number,
): Promise<PrivateProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: privateProfileSelect,
		});

		if (!user) return null;

		const acceptedFriends = [
			...user.friendshipsFrom
				.filter((f) => f.status === 'accepted')
				.map((f) => f.userBId),
			...user.friendshipsTo
				.filter((f) => f.status === 'accepted')
				.map((f) => f.userAId),
		];

		const stats = {
			poemsCount: user.poems.length,
			commentsCount: user.comments.length,
			friendsCount: acceptedFriends.length,
			poemsIds: user.poems.map((p) => p.id),
			friendsIds: acceptedFriends,
		};

		const friendshipRequests = [
			...user.friendshipsFrom.map((f) => ({
				status: f.status,
				isRequester: true,
				userId: f.userBId,
			})),
			...user.friendshipsTo.map((f) => ({
				status: f.status,
				isRequester: false,
				userId: f.userAId,
			})),
		];

		return {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio ?? null,
			avatarUrl: user.avatarUrl ?? null,
			role: user.role,
			status: user.status,
			email: user.email,
			emailVerifiedAt: user.emailVerifiedAt ?? null,
			stats,
			friendshipRequests,
		};
	});
}

export const QueriesRepository: UserReadRepository = {
	selectUserById,
	selectUserByNickname,
	selectUserByEmail,
	selectAuthUserByEmail,
	selectPublicProfile,
	selectPrivateProfile,
};
