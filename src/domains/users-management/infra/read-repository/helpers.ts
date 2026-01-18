import type { FullUser } from '../../use-cases/queries';
import { prisma } from '@GenericSubdomains/persistance/prisma/PrismaClient';
import { withPrismaErrorHandling } from '@GenericSubdomains/persistance/prisma/HandlePrismaErrors';
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
	friendshipsFrom: { userBId: number; status: string }[],
	friendshipsTo: { userAId: number; status: string }[],
): number[] {
	return [
		...friendshipsFrom
			.filter((f) => f.status === 'accepted')
			.map((f) => f.userBId),
		...friendshipsTo
			.filter((f) => f.status === 'accepted')
			.map((f) => f.userAId),
	];
}

export async function resolveFriendship(
	requesterId: number | undefined,
	userId: number,
): Promise<PublicProfile['friendship']> {
	if (!requesterId || requesterId === userId) {
		return { status: 'none', isRequester: false };
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
				status: relation.status,
				isRequester: relation.userAId === requesterId,
			}
		: { status: 'none', isRequester: false };
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
