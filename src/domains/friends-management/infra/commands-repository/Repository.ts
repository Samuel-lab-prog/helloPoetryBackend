import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type { FriendRequest } from '../../use-cases/commands/models/Index';

export function createFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.friendship.create({
			data: {
				userAId: fromUserId,
				userBId: toUserId,
				status: 'pending',
			},
		});
		return {
			fromUserId: fromUserId,
			toUserId: toUserId,
			status: 'pending',
		};
	});
}

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
};
