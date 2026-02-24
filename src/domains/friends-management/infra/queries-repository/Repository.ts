import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/Queries';
import type {
	FriendshipRecord,
	FriendRequestRecord,
	BlockedUserRecord,
} from '../../use-cases/Models';

function normalizePair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a];
}

function findFriendshipBetweenUsers(params: {
	user1Id: number;
	user2Id: number;
}): Promise<FriendshipRecord | null> {
	const [userAId, userBId] = normalizePair(params.user1Id, params.user2Id);

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.friendship.findFirst({
			where: { userAId, userBId },
		});
		if (!rs) return null;

		return {
			id: rs.id,
			createdAt: rs.createdAt,
			userAId: rs.userAId,
			userBId: rs.userBId,
		};
	});
}

function findFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequestRecord | null> {
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.friendshipRequest.findFirst({
			where: {
				requesterId: params.requesterId,
				addresseeId: params.addresseeId,
			},
		});
		if (!rs) return null;

		return {
			id: rs.id,
			createdAt: rs.createdAt,
			requesterId: rs.requesterId,
			addresseeId: rs.addresseeId,
		};
	});
}

function findBlockedRelationship({
	userId1,
	userId2,
}: {
	userId1: number;
	userId2: number;
}): Promise<BlockedUserRecord | null> {
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.blockedUser.findFirst({
			where: {
				OR: [
					{ blockerId: userId1, blockedId: userId2 },
					{ blockerId: userId2, blockedId: userId1 },
				],
			},
		});
		if (!rs) return null;

		return {
			blockedById: rs.blockerId,
			blockedUserId: rs.blockedId,
			createdAt: rs.createdAt,
			id: rs.id,
		};
	});
}

export const queriesRepository: QueriesRepository = {
	findFriendshipBetweenUsers,
	findFriendRequest,
	findBlockedRelationship,
};
