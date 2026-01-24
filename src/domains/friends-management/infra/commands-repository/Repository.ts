import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type { FriendRequest } from '../../use-cases/commands/models/Index';

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockFriendRequest,
};

export function acceptFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.friendship.updateManyAndReturn({
			where: {
				userAId: fromUserId,
				userBId: toUserId,
				status: 'pending',
			},
			data: {
				status: 'accepted',
			},
			select: { status: true },
		});
		return { fromUserId, toUserId, status: rs[0]!.status };
	});
}

export function createFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;
	return withPrismaErrorHandling(async () => {
		const result = await prisma.friendship.create({
			data: {
				userAId: fromUserId,
				userBId: toUserId,
				status: 'pending',
			},
			select: { status: true },
		});
		return {
			fromUserId,
			toUserId,
			status: result.status,
		};
	});
}

export function rejectFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;
	return withPrismaErrorHandling(async () => {
		const result = await prisma.friendship.updateManyAndReturn({
			where: {
				userAId: fromUserId,
				userBId: toUserId,
				status: 'pending',
			},
			data: {
				status: 'rejected',
			},
		});
		return {
			fromUserId,
			toUserId,
			status: result[0]!.status,
		};
	});
}

export function blockFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.friendship.updateManyAndReturn({
			where: {
				userAId: fromUserId,
				userBId: toUserId,
			},
			data: {
				status: 'blocked',
			},
			select: { status: true },
		});
		return { fromUserId, toUserId, status: rs[0]!.status };
	});
}
