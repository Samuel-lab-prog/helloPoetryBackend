import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/QueriesRepository';
import type { FriendshipRecord } from '../../use-cases/queries/models/Index';

export function findFriendshipBetweenUsers(params: {
	userAId: number;
	userBId: number;
}): Promise<FriendshipRecord | null> {
	const { userAId, userBId } = params;
	return withPrismaErrorHandling(() => {
		return prisma.friendship.findFirst({
			where: {
				OR: [
					{ userAId, userBId },
					{ userAId: userBId, userBId: userAId },
				],
			},
		});
	});
}

export const queriesRepository: QueriesRepository = {
	findFriendshipBetweenUsers,
};
