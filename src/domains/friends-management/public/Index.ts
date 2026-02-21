import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

export type UsersRelationBasicInfo = {
	areFriends: boolean;
	areBlocked: boolean;
};

export type Relation = {
	friends: boolean;
	blockedId: number | null;
	blockedBy: number | null;
	requestSentByUserId: number | null;
};

export interface FriendsPublicContract {
	selectUsersRelation(
		userId1: number,
		userId2: number,
	): Promise<UsersRelationBasicInfo>;
	selectRelation(userId1: number, userId2: number): Promise<Relation>;

	selectFollowedUserIds(userId: number): Promise<number[]>;
	selectBlockedUserIds(userId: number): Promise<number[]>;
	areFriends(userId1: number, userId2: number): Promise<boolean>;
	areBlocked(userId1: number, userId2: number): Promise<boolean>;
}

function areFriends(userAId: number, userBId: number): Promise<boolean> {
	return withPrismaErrorHandling(async () => {
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

function areBlocked(userAId: number, userBId: number): Promise<boolean> {
	return withPrismaErrorHandling(async () => {
		const blocked = await prisma.blockedUser.findFirst({
			where: {
				blockerId: userAId,
				blockedId: userBId,
			},
		});

		return blocked !== null;
	});
}

function selectFollowedUserIds(userId: number): Promise<number[]> {
	return withPrismaErrorHandling(async () => {
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

function selectRelation(userAId: number, userBId: number): Promise<Relation> {
	return withPrismaErrorHandling(async () => {
		const [friendship, blockAtoB, blockBtoA, request] = await Promise.all([
			prisma.friendship.findFirst({
				where: {
					OR: [
						{ userAId: userAId, userBId: userBId },
						{ userAId: userBId, userBId: userAId },
					],
				},
				select: { id: true },
			}),

			prisma.blockedUser.findFirst({
				where: {
					blockerId: userAId,
					blockedId: userBId,
				},
				select: { id: true },
			}),

			prisma.blockedUser.findFirst({
				where: {
					blockerId: userBId,
					blockedId: userAId,
				},
				select: { id: true },
			}),

			prisma.friendshipRequest.findFirst({
				where: {
					OR: [
						{ requesterId: userAId, addresseeId: userBId },
						{ requesterId: userBId, addresseeId: userAId },
					],
				},
				select: {
					requesterId: true,
				},
			}),
		]);

		return {
			friends: friendship !== null,
			blockedId: blockAtoB?.id ?? null,
			blockedBy: blockBtoA?.id ?? null,
			requestSentByUserId: request?.requesterId ?? null,
		};
	});
}

function selectBlockedUserIds(userId: number): Promise<number[]> {
	return withPrismaErrorHandling(async () => {
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

async function selectUsersRelation(
	userAId: number,
	userBId: number,
): Promise<UsersRelationBasicInfo> {
	const [friends, blocked] = await Promise.all([
		areFriends(userAId, userBId),
		areBlocked(userAId, userBId),
	]);

	return {
		areFriends: friends,
		areBlocked: blocked,
	};
}

export const friendsPublicContract: FriendsPublicContract = {
	selectFollowedUserIds,
	selectBlockedUserIds,
	areFriends,
	areBlocked,
	selectRelation,
	selectUsersRelation,
};
