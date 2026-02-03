import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { FriendsContractForRecomendationEngine } from '@Domains/feed-engine/ports/FriendsServices';
import type { FriendsContractForInteractions } from '@Domains/interactions/ports/FriendsServices';

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
		const blocked = await prisma.blockedUser.findMany({
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

async function areFriends(userAId: number, userBId: number): Promise<boolean> {
	return await withPrismaErrorHandling(async () => {
		const friendship = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ userAId, userBId },
					{ userAId: userBId, userBId: userAId },
				],
			},
		});
		return friendship !== null;
	});
}

async function areBlocked(userAId: number, userBId: number): Promise<boolean> {
	return await withPrismaErrorHandling(async () => {
		const blocked = await prisma.blockedUser.findFirst({
			where: {
				blockerId: userAId,
				blockedId: userBId,
			},
		});
		return blocked !== null;
	});
}

export const friendsServicesForRecomendationEngine: FriendsContractForRecomendationEngine = {
		getFollowedUserIds,
		getBlockedUserIds,
	};
	
export const friendsServicesForInteractions: FriendsContractForInteractions = {
	areFriends,
	areBlocked,
};
