/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@PrismaClient';
import type { UserWhereInput } from '@Prisma/generated/models/User';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository, SelectUsersParams } from '../../ports/Queries';

import type {
	UserPublicProfile,
	UserPrivateProfile,
	UsersPage,
	FullUser,
} from '../../use-cases/Models';

import {
	publicProfileSelect,
	fromRawToPublicProfile,
	privateProfileSelect,
	fromRawToPrivateProfile,
	fullUserSelect,
	previewUserSelect,
	fromRawToPreviewUser,
} from './selects/Index';

type UserUniqueWhere =
	| { id: number }
	| { email: string }
	| { nickname: string };

function selectFullUser(
	where: UserUniqueWhere & { deletedAt: null },
): Promise<FullUser | null> {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where,
			select: fullUserSelect,
		}),
	);
}

const selectUserById = (id: number) => selectFullUser({ id, deletedAt: null });

const selectUserByEmail = (email: string) =>
	selectFullUser({ email, deletedAt: null });

const selectUserByNickname = (nickname: string) =>
	selectFullUser({ nickname, deletedAt: null });

function selectProfile(params: {
	id: number;
	isPrivate: boolean;
}): Promise<UserPrivateProfile | UserPublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findFirst({
			where: { id: params.id, deletedAt: null },
			select: params.isPrivate ? privateProfileSelect : publicProfileSelect,
		});

		if (!user) return null;
		return params.isPrivate
			? fromRawToPrivateProfile(user as any)
			: fromRawToPublicProfile(user as any, params.id);
	});
}

function selectUsers(params: SelectUsersParams): Promise<UsersPage> {
	return withPrismaErrorHandling(async () => {
		const {
			navigationOptions: { cursor, limit },
			filterOptions: { searchNickname },
			sortOptions: { orderBy, orderDirection },
		} = params;

		const where: UserWhereInput = {
			deletedAt: null,
			...(searchNickname && {
				nickname: {
					contains: searchNickname,
					mode: 'insensitive',
				},
			}),
		};

		const users = await prisma.user.findMany({
			where,
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: {
				[orderBy]: orderDirection,
			},
			select: previewUserSelect,
		});

		const hasMore = users.length > limit;
		const items = hasMore ? users.slice(0, limit) : users;

		return {
			users: items.map(fromRawToPreviewUser),
			hasMore,
			nextCursor: items.at(-1)?.id,
		};
	});
}

export const queriesRepository: QueriesRepository = {
	selectUserById,
	selectUserByEmail,
	selectUserByNickname,
	selectProfile,
	selectUsers,
};
