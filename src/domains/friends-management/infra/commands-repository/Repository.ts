import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	FriendRequestRecord,
	FriendRequestRejectionRecord,
	FriendshipRecord,
	BlockedUserRecord,
	UnblockUserRecord,
	CancelFriendRequestRecord,
	RemovedFriendRecord,
} from '../../use-cases/Models';

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockUser,
	deleteFriend,
	deleteFriendRequestIfExists,
	cancelFriendRequest,
	unblockUser,
};

export function createFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<FriendRequestRecord> {
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.friendshipRequest.create({
			data: {
				requesterId,
				addresseeId,
			},
		});

		return {
			requesterId: rs.requesterId,
			addresseeId: rs.addresseeId,
			createdAt: rs.createdAt,
			id: rs.id,
		};
	});
}

export function acceptFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<FriendshipRecord> {
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.$transaction([
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

		return {
			userAId: rs[1]!.userAId,
			userBId: rs[1]!.userBId,
			createdAt: rs[1]!.createdAt,
			id: rs[1]!.id,
		};
	});
}

export function rejectFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<FriendRequestRejectionRecord> {
	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.delete({
			where: {
				requesterId_addresseeId: {
					requesterId,
					addresseeId,
				},
			},
		});

		return {
			rejectedId: addresseeId,
			rejecterId: requesterId,
		};
	});
}

export function blockUser(
	requesterId: number,
	addresseeId: number,
): Promise<BlockedUserRecord> {
	return withPrismaErrorHandling(async () => {
		const [, , blocked] = await prisma.$transaction([
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

		return {
			blockedById: blocked.blockerId,
			blockedUserId: blocked.blockedId,
			id: blocked.id,
			createdAt: blocked.createdAt,
		};
	});
}

export function cancelFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<CancelFriendRequestRecord> {
	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.delete({
			where: {
				requesterId_addresseeId: {
					requesterId,
					addresseeId,
				},
			},
		});

		return {
			cancelledId: addresseeId,
			cancellerId: requesterId,
		};
	});
}

export function unblockUser(
	requesterId: number,
	addresseeId: number,
): Promise<UnblockUserRecord> {
	return withPrismaErrorHandling(async () => {
		await prisma.blockedUser.delete({
			where: {
				blockerId_blockedId: {
					blockerId: requesterId,
					blockedId: addresseeId,
				},
			},
		});

		return {
			unblockerId: requesterId,
			unblockedId: addresseeId,
		};
	});
}

export function deleteFriend(
	removedById: number,
	removedId: number,
): Promise<RemovedFriendRecord> {
	return withPrismaErrorHandling(async () => {
		await prisma.friendship.deleteMany({
			where: {
				OR: [
					{ userAId: removedById, userBId: removedId },
					{ userAId: removedId, userBId: removedById },
				],
			},
		});

		return {
			removedById,
			removedId,
		};
	});
}

export function deleteFriendRequestIfExists(
	requesterId: number,
	addresseeId: number,
): Promise<void> {
	return withPrismaErrorHandling(async () => {
		await prisma.friendshipRequest.deleteMany({
			where: {
				requesterId,
				addresseeId,
			},
		});
	});
}
