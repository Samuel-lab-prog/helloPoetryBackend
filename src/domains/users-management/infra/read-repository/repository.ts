import { prisma } from '@root/generic-subdomains/persistance/prisma/PrismaClient';
import type { UserWhereInput } from '@root/generic-subdomains/persistance/prisma/generated/models/User';
import { withPrismaErrorHandling } from '@root/generic-subdomains/persistance/prisma/HandlePrismaErrors';

import type {
	userQueriesRepository,
	SelectUsersParams,
} from '../../ports/QueriesRepository';

import type {
	PublicProfile,
	PrivateProfile,
	ClientAuthCredentials,
	SelectUsersPage,
} from '../../use-cases/queries';

import {
	authUserSelect,
	publicProfileSelect,
	privateProfileSelect,
	previewUserSelect,
} from './selectsModels';

import {
	extractAcceptedFriendsIds,
	extractFriendsIds,
	resolveFriendship,
	selectFullUser,
} from './helpers';

const selectUserById = (id: number) => selectFullUser({ id });

const selectUserByEmail = (email: string) => selectFullUser({ email });

const selectUserByNickname = (nickname: string) => selectFullUser({ nickname });

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where: { email },
			select: authUserSelect,
		}),
	);
}

function selectPublicProfile(
	id: number,
	requesterId?: number,
): Promise<PublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: publicProfileSelect,
		});

		if (!user) return null;

		const friendship = await resolveFriendship(requesterId, user.id);

		return {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio,
			avatarUrl: user.avatarUrl,
			role: user.role,
			status: user.status,
			stats: {
				poemsCount: user.poems.length,
				commentsCount: user.comments.length,
				friendsCount: user.friendshipsFrom.length + user.friendshipsTo.length,
			},
			friendship,
		};
	});
}

function selectPrivateProfile(id: number): Promise<PrivateProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: privateProfileSelect,
		});

		if (!user) return null;

		const acceptedFriendsIds = extractAcceptedFriendsIds(
			user.friendshipsFrom,
			user.friendshipsTo,
		);

		return {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio ?? null,
			avatarUrl: user.avatarUrl ?? null,
			role: user.role,
			status: user.status,
			email: user.email,
			emailVerifiedAt: user.emailVerifiedAt ?? null,
			friendsIds: extractFriendsIds(user.friendshipsFrom, user.friendshipsTo),
			stats: {
				poemsCount: user.poems.length,
				commentsCount: user.comments.length,
				friendsCount: acceptedFriendsIds.length,
				poemsIds: user.poems.map((p) => p.id),
				friendsIds: acceptedFriendsIds,
			},
			friendshipRequests: [
				...user.friendshipsFrom.map((f) => ({
					status: f.status,
					isRequester: true,
					userId: f.userBId,
				})),
				...user.friendshipsTo.map((f) => ({
					status: f.status,
					isRequester: false,
					userId: f.userAId,
				})),
			],
		};
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
			orderBy: { [orderBy]: orderDirection },
			select: previewUserSelect,
		});

		const hasMore = users.length > limit;
		const items = hasMore ? users.slice(0, limit) : users;

		return {
			users: items,
			hasMore,
			nextCursor: items.at(-1)?.id,
		};
	});
}

export const QueriesRepository: userQueriesRepository = {
	selectUserById,
	selectUserByEmail,
	selectUserByNickname,
	selectAuthUserByEmail,
	selectPublicProfile,
	selectPrivateProfile,
	selectUsers,
};
