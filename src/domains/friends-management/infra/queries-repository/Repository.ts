import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/QueriesRepository';
import type {
	FriendshipRecord,
	FriendRequestRecord,
	BlockedFriendRecord,
} from '../../use-cases/queries/models/Index';

function normalizePair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a];
}

function findFriendshipBetweenUsers(params: {
	user1Id: number;
	user2Id: number;
}): Promise<FriendshipRecord | null> {
	const [userAId, userBId] = normalizePair(params.user1Id, params.user2Id);

	return withPrismaErrorHandling(() =>
		prisma.friendship.findFirst({
			where: { userAId, userBId },
		}),
	);
}

function findFriendRequest(params: {
	requesterId: number;
	addresseeId: number;
}): Promise<FriendRequestRecord | null> {
	return withPrismaErrorHandling(() =>
		prisma.friendshipRequest.findFirst({
			where: {
				requesterId: params.requesterId,
				addresseeId: params.addresseeId,
			},
		}),
	);
}

function findBlockedRelationship({
	userId1,
	userId2,
}: {
	userId1: number;
	userId2: number;
}): Promise<BlockedFriendRecord | null> {
	return withPrismaErrorHandling(() =>
		prisma.blockedUser.findFirst({
			where: {
				OR: [
					{ blockerId: userId1, blockedId: userId2 },
					{ blockerId: userId2, blockedId: userId1 },
				],
			},
		}),
	);
}

export const queriesRepository: QueriesRepository = {
	findFriendshipBetweenUsers,
	findFriendRequest,
	findBlockedRelationship,
};
