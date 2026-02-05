import { prisma } from '@PrismaClient';
import type { UserWhereInput } from '@Prisma/generated/models/User';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type {
	QueriesRepository,
	SelectUsersParams,
} from '../../ports/QueriesRepository';

import type {
	PublicProfile,
	PrivateProfile,
	UserAuthCredentials,
	SelectUsersPage,
	FullUser,
} from '../../use-cases/queries/Index';

import {
	fromRawToPrivateProfile,
	privateProfileSelect,
} from './selects/PrivateProfile';
import { previewUserSelect, fromRawToPreviewUser } from './selects/PreviewUser';
import { authUserSelect } from './selects/AuthUser';
import {
	publicProfileSelect,
	fromRawToPublicProfile,
} from './selects/PublicProfile';
import { fullUserSelect } from './selects/FullUser';

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

function selectAuthUserByEmail(
	email: string,
): Promise<UserAuthCredentials | null> {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where: { email },
			select: authUserSelect,
		}),
	);
}

function selectPublicProfile(
	id: number,
	requesterId: number,
): Promise<PublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findFirst({
			where: { id, deletedAt: null },
			select: publicProfileSelect,
		});

		if (!user) return null;
		return fromRawToPublicProfile(user, requesterId);
	});
}

function selectPrivateProfile(id: number): Promise<PrivateProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findFirst({
			where: { id, deletedAt: null },
			select: privateProfileSelect,
		});

		if (!user) return null;
		return fromRawToPrivateProfile(user);
	});
}

function selectUsers(params: SelectUsersParams): Promise<SelectUsersPage> {
	return withPrismaErrorHandling(async () => {
		const {
			navigationOptions: { cursor, limit },
			filterOptions: { searchNickname, status },
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
			...(status && { status }),
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
	selectAuthUserByEmail,
	selectPublicProfile,
	selectPrivateProfile,
	selectUsers,
};
