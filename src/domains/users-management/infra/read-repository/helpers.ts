import type { FullUser } from '../../use-cases/queries';
import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import { fullUserSelect } from './selectsModels';
import type { PublicProfile } from '../../use-cases/queries/read-models/PublicProfile';

export function extractFriendsIds(
	friendshipsFrom: { userBId: number }[],
	friendshipsTo: { userAId: number }[],
): number[] {
	return [
		...friendshipsFrom.map((f) => f.userBId),
		...friendshipsTo.map((f) => f.userAId),
	];
}

export function extractAcceptedFriendsIds(
	friendshipsFrom: { userBId: number }[],
	friendshipsTo: { userAId: number }[],
): number[] {
	return [
		...friendshipsFrom.map((f) => f.userBId),
		...friendshipsTo.map((f) => f.userAId),
	];
}

export async function resolveFriendship(
	requesterId: number | undefined,
	userId: number,
): Promise<PublicProfile['friendship']> {
	if (!requesterId || requesterId === userId) {
		return undefined;
	}

	const relation = await prisma.friendship.findFirst({
		where: {
			OR: [
				{ userAId: requesterId, userBId: userId },
				{ userAId: userId, userBId: requesterId },
			],
		},
	});

	return relation
		? {
				isRequester: relation.userAId === requesterId,
			}
		: undefined;
}

type UserUniqueWhere =
	| { id: number }
	| { email: string }
	| { nickname: string };

export async function selectFullUser(
	where: UserUniqueWhere,
): Promise<FullUser | null> {
	const user = await withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where,
			select: fullUserSelect,
		}),
	);

	if (!user) return null;

	return {
		...user,
		friendsIds: extractFriendsIds(user.friendshipsFrom, user.friendshipsTo),
	};
}
