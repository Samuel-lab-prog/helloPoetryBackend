/* eslint-disable no-useless-assignment */
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
} from '../../use-cases/queries/Index';

import {
	authUserSelect,
	privateProfileSelect,
	previewUserSelect,
	publicProfileSelect,
} from './selectsModels';

import { selectFullUser } from './helpers';

const selectUserById = (id: number) => selectFullUser({ id });
const selectUserByEmail = (email: string) => selectFullUser({ email });
const selectUserByNickname = (nickname: string) => selectFullUser({ nickname });

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
		const user = await prisma.user.findUnique({
			where: { id },
			select: publicProfileSelect,
		});

		if (!user) return null;

		const stats = {
			poemsCount: user.poems.length,
			commentsCount: user.comments.length,
			friendsCount: user.friendshipsFrom.length + user.friendshipsTo.length,
		};

		let isFriend = false;
		let isBlocked = false;
		let isRequester = false;

		isFriend =
			user.friendshipsFrom.some((f) => f.userBId === requesterId) ||
			user.friendshipsTo.some((f) => f.userAId === requesterId);

		isBlocked =
			user.blockedFriends.some((b) => b.blockedId === requesterId) ||
			user.blockedBy.some((b) => b.blockerId === requesterId);

		isRequester = user.id === requesterId;

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
			isBlocked,
			isRequester,
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

		const friendsIds = [
			...user.friendshipsFrom.map((f) => f.userBId),
			...user.friendshipsTo.map((f) => f.userAId),
		];

		const stats = {
			poemsIds: user.poems.map((p) => p.id),
			commentsIds: user.comments.map((c) => c.id),
			friendsIds,
		};

		const friendshipRequestsSent = user.friendshipRequests
			.filter((r) => r.requesterId === user.id)
			.map((r) => ({
				addresseeId: r.addresseeId,
				addresseeNickname: r.addressee.nickname,
				addresseeAvatarUrl: r.addressee.avatarUrl,
			}));

		const friendshipRequestsReceived = user.friendshipRequests
			.filter((r) => r.addresseeId === user.id)
			.map((r) => ({
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

export const queriesRepository: QueriesRepository = {
	selectUserById,
	selectUserByEmail,
	selectUserByNickname,
	selectAuthUserByEmail,
	selectPublicProfile,
	selectPrivateProfile,
	selectUsers,
};
