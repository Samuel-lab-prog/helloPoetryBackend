import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { FriendsContractForRecomendationEngine } from '@Domains/feed-engine/ports/FriendsServices';

async function getFollowedUserIds(userId: number): Promise<number[]> {
	return await withPrismaErrorHandling(async () => {
		const result = await prisma.friendship.findMany({
			where: {
				userAId: userId,
				status: 'accepted',
				OR: [{ userBId: userId, status: 'accepted' }],
			},
			select: {
				id: true,
			},
		});
		return result.map((item) => item.id);
	});
}

async function getBlockedUserIds(userId: number): Promise<number[]> {
	return await withPrismaErrorHandling(async () => {
		const result = await prisma.friendship.findMany({
			where: {
				userAId: userId,
				status: 'blocked',
				OR: [{ userBId: userId, status: 'blocked' }],
			},
			select: {
				id: true,
			},
		});
		return result.map((item) => item.id);
	});
}

export const friendsServicesForRecomendationEngine: FriendsContractForRecomendationEngine =
	{
		getFollowedUserIds,
		getBlockedUserIds,
	};
