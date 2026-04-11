import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { UserStatus, UserRole } from '../ports/models';
import { withRequestCache } from '@GenericSubdomains/utils/requestCache';

export type UserBasicInfo = {
	exists: boolean;
	id: number;
	status: UserStatus;
	role: UserRole;
	nickname: string;
	avatarUrl?: string | null;
};

export type ClientAuthCredentials = {
	id: number;
	role: UserRole;
	email: string;
	status: UserStatus;
	passwordHash: string;
};

export interface UsersPublicContract {
	selectUserBasicInfo(userId: number): Promise<UserBasicInfo>;
	selectAuthUserByEmail(email: string): Promise<ClientAuthCredentials | null>;
}

async function selectUserBasicInfo(userId: number) {
	return await withRequestCache(`users.basic:${userId}`, () =>
		withPrismaErrorHandling(async () => {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					status: true,
					role: true,
					nickname: true,
					avatarUrl: true,
				},
			});

			if (!user) {
				return {
					exists: false,
					id: -1,
					status: 'banned' as const,
					role: 'author' as const,
					nickname: '',
					avatarUrl: null,
				};
			}

			return {
				exists: true,
				id: user.id,
				status: user.status,
				role: user.role,
				nickname: user.nickname,
				avatarUrl: user.avatarUrl,
			};
		}),
	);
}

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where: { email, deletedAt: null },
			select: {
				id: true,
				email: true,
				passwordHash: true,
				role: true,
				status: true,
			},
		}),
	);
}

export const usersPublicContract: UsersPublicContract = {
	selectUserBasicInfo,
	selectAuthUserByEmail,
};
