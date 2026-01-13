import { prisma } from '../../../../prisma/myClient';
import type { UserWhereInput } from '@prisma/generated/models/User';
import { withPrismaErrorHandling } from '@AppError';

import type {
	UserReadRepository,
	SelectUsersParams,
} from '../../ports/QueriesRepository';
import type {
	FullUser,
	PublicProfile,
	PrivateProfile,
	ClientAuthCredentials,
	SelectUsersPage,
} from '../../use-cases/queries/read-models/index';
import {
	authUserSelect,
	fullUserSelect,
	publicProfileSelect,
	privateProfileSelect,
	previewUserSelect,
} from './helpers';

function selectUserById(id: number): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { id },
			select: fullUserSelect,
		});
	});
}

function selectUserByNickname(nickname: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { nickname },
			select: fullUserSelect,
		});
	});
}

function selectUserByEmail(email: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: fullUserSelect,
		});
	});
}

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: authUserSelect,
		});
	});
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

		let friendship: PublicProfile['friendship'] = {
			status: 'none',
			isRequester: false,
		};

		if (requesterId && requesterId !== user.id) {
			const relation = await prisma.friendship.findFirst({
				where: {
					OR: [
						{ userAId: requesterId, userBId: user.id },
						{ userAId: user.id, userBId: requesterId },
					],
				},
			});

			friendship = relation
				? {
						status: relation.status,
						isRequester: relation.userAId === requesterId,
					}
				: {
						status: 'none',
						isRequester: false,
					};
		}

		const profile: PublicProfile = {
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

		return profile;
	});
}

export function selectPrivateProfile(
	id: number,
): Promise<PrivateProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id },
			select: privateProfileSelect,
		});

		if (!user) return null;

		const acceptedFriends = [
			...user.friendshipsFrom
				.filter((f) => f.status === 'accepted')
				.map((f) => f.userBId),
			...user.friendshipsTo
				.filter((f) => f.status === 'accepted')
				.map((f) => f.userAId),
		];

		const stats = {
			poemsCount: user.poems.length,
			commentsCount: user.comments.length,
			friendsCount: acceptedFriends.length,
			poemsIds: user.poems.map((p) => p.id),
			friendsIds: acceptedFriends,
		};

		const friendshipRequests = [
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
		];

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
			stats,
			friendshipRequests,
		};
	});
}

export function selectUsers(
	params: SelectUsersParams,
): Promise<SelectUsersPage> {
	return withPrismaErrorHandling(async () => {
		const { navigationOptions, filterOptions, sortOptions } = params;
		const { cursor, limit } = navigationOptions;
		const { searchNickname, status } = filterOptions;
		const { orderBy, orderDirection } = sortOptions;

		const where: UserWhereInput = {};

		if (searchNickname) {
			where.nickname = {
				contains: searchNickname,
				mode: 'insensitive',
			};
		}

		if (status) {
			where.status = status;
		}

		const users = await prisma.user.findMany({
			where,
			take: limit + 1,
			...(cursor && {
				cursor: cursor ? { id: cursor } : undefined,
				skip: 1,
			}),
			orderBy: {
				[orderBy]: orderDirection,
			},
			select: previewUserSelect,
		});

		const hasMore = users.length > limit;
		const items = hasMore ? users.slice(0, limit) : users;

		const nextCursor =
			items.length > 0 ? items[items.length - 1]!.id : undefined;

		return {
			users: items,
			nextCursor,
			hasMore,
		};
	});
}

export const QueriesRepository: UserReadRepository = {
	selectUserById,
	selectUserByNickname,
	selectUserByEmail,
	selectAuthUserByEmail,
	selectPublicProfile,
	selectPrivateProfile,
	selectUsers,
};
