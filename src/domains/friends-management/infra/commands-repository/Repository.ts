import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type { FriendRequest } from '../../use-cases/commands/models/Index';

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockFriendRequest,
	deleteFriend,
};

export function createFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.create({
			data: {
				requesterId: fromUserId,
				addresseeId: toUserId,
			},
		});

		return { fromUserId, toUserId };
	});
}

export function acceptFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.delete({
				where: {
					requesterId_addresseeId: {
						requesterId: fromUserId,
						addresseeId: toUserId,
					},
				},
			}),
			prisma.friendship.create({
				data: {
					userAId: fromUserId,
					userBId: toUserId,
				},
			}),
		]);

		return { fromUserId, toUserId };
	});
}

export function rejectFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.delete({
			where: {
				requesterId_addresseeId: {
					requesterId: fromUserId,
					addresseeId: toUserId,
				},
			},
		});

		return { fromUserId, toUserId };
	});
}

/**
 * BLOCK USER (also removes friendship and requests)
 */
export function blockFriendRequest(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<FriendRequest> {
	const { fromUserId, toUserId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.deleteMany({
				where: {
					OR: [
						{ requesterId: fromUserId, addresseeId: toUserId },
						{ requesterId: toUserId, addresseeId: fromUserId },
					],
				},
			}),
			prisma.friendship.deleteMany({
				where: {
					OR: [
						{ userAId: fromUserId, userBId: toUserId },
						{ userAId: toUserId, userBId: fromUserId },
					],
				},
			}),
			prisma.blockedFriend.create({
				data: {
					blockerId: fromUserId,
					blockedId: toUserId,
				},
			}),
		]);

		return { fromUserId, toUserId };
	});
}

export function deleteFriend(params: {
	fromUserId: number;
	toUserId: number;
}): Promise<{ fromUserId: number; toUserId: number }> {
	const { fromUserId, toUserId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.friendship.deleteMany({
			where: {
				OR: [
					{ userAId: fromUserId, userBId: toUserId },
					{ userAId: toUserId, userBId: fromUserId },
				],
			},
		});

		return { fromUserId, toUserId };
	});
}
