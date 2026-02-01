import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type { FriendRequest } from '../../use-cases/commands/models/Index';

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockUser,
	deleteFriend,
	deleteFriendRequestIfExists,
	cancelFriendRequest,
	unblockFriendRequest,
};

export function createFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.create({
			data: {
				requesterId,
				addresseeId,
			},
		});

		return { requesterId, addresseeId };
	});
}

export function acceptFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.delete({
				where: {
					requesterId_addresseeId: {
						requesterId,
						addresseeId,
					},
				},
			}),
			prisma.friendship.create({
				data: {
					userAId: requesterId,
					userBId: addresseeId,
				},
			}),
		]);

		return { requesterId, addresseeId };
	});
}

export function rejectFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.delete({
				where: {
					requesterId_addresseeId: {
						requesterId,
						addresseeId,
					},
				},
			}),
		]);

		return { requesterId, addresseeId };
	});
}

/**
 * BLOCK USER (also removes friendship and requests)
 */
export function blockUser(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;

	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.deleteMany({
				where: {
					OR: [
						{ requesterId, addresseeId },
						{ requesterId: addresseeId, addresseeId: requesterId },
					],
				},
			}),
			prisma.friendship.deleteMany({
				where: {
					OR: [
						{ userAId: requesterId, userBId: addresseeId },
						{ userAId: addresseeId, userBId: requesterId },
					],
				},
			}),
			prisma.blockedUser.create({
				data: {
					blockerId: requesterId,
					blockedId: addresseeId,
				},
			}),
		]);

		return { requesterId, addresseeId };
	});
}

export function cancelFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.delete({
				where: {
					requesterId_addresseeId: {
						requesterId: requesterId,
						addresseeId: addresseeId,
					},
				},
			}),
		]);
		return { requesterId, addresseeId };
	});
}

export function unblockFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequest> {
	const { requesterId, addresseeId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.blockedUser.delete({
				where: {
					blockerId_blockedId: {
						blockerId: requesterId,
						blockedId: addresseeId,
					},
				},
			}),
		]);
		return { requesterId, addresseeId };
	});
}

export function deleteFriend(params: {
	user1Id: number;
	user2Id: number;
}): Promise<void> {
	const { user1Id, user2Id } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction([
			prisma.friendshipRequest.deleteMany({
				where: {
					OR: [
						{ requesterId: user1Id, addresseeId: user2Id },
						{ requesterId: user2Id, addresseeId: user1Id },
					],
				},
			}),
		]);
	});
}

export function deleteFriendRequestIfExists(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<void> {
	const { requesterId, addresseeId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.deleteMany({
			where: {
				requesterId,
				addresseeId,
			},
		});
	});
}
