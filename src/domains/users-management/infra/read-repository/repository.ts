import { prisma } from '@PrismaClient';
import type { UserWhereInput } from '@Prisma/generated/models/User';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import {
	ACTIVE_USER_WHERE,
	selectFullUser,
	USER_ORDER_FIELDS,
} from './helpers';

import type {
	QueriesRepository,
	SelectUsersParams,
} from '../../ports/QueriesRepository';

import type {
	PublicProfile,
	PrivateProfile,
	UserAuthCredentials,
	SelectUsersPage,
} from '../../use-cases/queries/Index';

import {
	authUserSelect,
	privateProfileSelect,
	previewUserSelect,
	publicProfileSelect,
} from './selectsModels';

const selectUserById = (id: number) =>
	selectFullUser({ id, ...ACTIVE_USER_WHERE });

const selectUserByEmail = (email: string) =>
	selectFullUser({ email, ...ACTIVE_USER_WHERE });

const selectUserByNickname = (nickname: string) =>
	selectFullUser({ nickname, ...ACTIVE_USER_WHERE });

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
			where: { id, ...ACTIVE_USER_WHERE },
			select: publicProfileSelect,
		});

		if (!user) return null;

		const friendsIds = [
			...user.friendshipsFrom.map((f) => f.userBId),
			...user.friendshipsTo.map((f) => f.userAId),
		];

		const stats = {
			poemsCount: user.poems.length,
			commentsCount: user.comments.length,
			friendsCount: friendsIds.length,
		};
		const isFriend = friendsIds.includes(requesterId);

		const hasBlockedRequester = user.blockedFriends.some(
			(b) => b.blockedId === requesterId,
		);

		const isBlockedByRequester = user.blockedBy.some(
			(b) => b.blockerId === requesterId,
		);

		return {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio,
			avatarUrl: user.avatarUrl,
			role: user.role,
			status: user.status,
			stats,
			isFriend,
			hasBlockedRequester,
			isBlockedByRequester,
			isFriendRequester: user.id === requesterId,
		};
	});
}

function selectPrivateProfile(id: number): Promise<PrivateProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findFirst({
			where: { id, ...ACTIVE_USER_WHERE },
			select: {
				...privateProfileSelect,
				blockedFriends: { select: { blockedId: true } },
			},
		});

		if (!user) return null;

		const friendsIds = [
			...user.friendshipsFrom.map((f) => f.userBId),
			...user.friendshipsTo.map((f) => f.userAId),
		];

		const stats = {
			poemsIds: user.poems.map((p) => p.id),
			commentsIds: user.comments.map((c) => c.id),
			friendsIds,
		};

		const friendshipRequestsSent = user.friendshipRequests.map((r) => ({
			addresseeId: r.addresseeId,
			addresseeNickname: r.addressee.nickname,
			addresseeAvatarUrl: r.addressee.avatarUrl,
		}));

		const friendshipRequestsReceived = user.friendshipAddressees.map((r) => ({
			requesterId: r.requesterId,
			requesterNickname: r.requester.nickname,
			requesterAvatarUrl: r.requester.avatarUrl,
		}));
		return {
			id: user.id,
			nickname: user.nickname,
			name: user.name,
			bio: user.bio,
			avatarUrl: user.avatarUrl,
			role: user.role,
			status: user.status,
			email: user.email,
			emailVerifiedAt: user.emailVerifiedAt,
			friendsIds,
			stats,
			friendshipRequestsSent,
			friendshipRequestsReceived,
			blockedUsersIds: user.blockedFriends.map((b) => b.blockedId),
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

		if (!(orderBy in USER_ORDER_FIELDS)) {
			throw new Error('Invalid order field');
		}

		const where: UserWhereInput = {
			...ACTIVE_USER_WHERE,
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
			users: items,
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
