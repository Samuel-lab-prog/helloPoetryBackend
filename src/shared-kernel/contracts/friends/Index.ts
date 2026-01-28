import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { FriendsContractForRecomendationEngine } from '@Domains/feed-engine/ports/FriendsServices';

async function getFollowedUserIds(userId: number): Promise<number[]> {
	return await withPrismaErrorHandling(async () => {
		const friendships = await prisma.friendship.findMany({
			where: {
				OR: [{ userAId: userId }, { userBId: userId }],
			},
			select: {
				userAId: true,
				userBId: true,
			},
		});

		return friendships.map((f) =>
			f.userAId === userId ? f.userBId : f.userAId,
		);
	});
}

async function getBlockedUserIds(userId: number): Promise<number[]> {
	return await withPrismaErrorHandling(async () => {
		const blocked = await prisma.blockedFriend.findMany({
			where: {
				blockerId: userId,
			},
			select: {
				blockedId: true,
			},
		});

		return blocked.map((b) => b.blockedId);
	});
}

export const friendsServicesForRecomendationEngine: FriendsContractForRecomendationEngine =
	{
		getFollowedUserIds,
		getBlockedUserIds,
	};
