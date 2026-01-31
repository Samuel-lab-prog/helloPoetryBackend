import type { FullUser } from '../../use-cases/queries/Index';
import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import { fullUserSelect } from './selectsModels';

function extractFriendsIds(
	friendshipsFrom: { userBId: number }[],
	friendshipsTo: { userAId: number }[],
): number[] {
	return [
		...friendshipsFrom.map((f) => f.userBId),
		...friendshipsTo.map((f) => f.userAId),
	];
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
