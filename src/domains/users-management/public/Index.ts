import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { UserStatus, UserRole } from '../use-cases/Models';

export type UserBasicInfo = {
	exists: boolean;
	id: number;
	status: UserStatus;
	role: UserRole;
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
	return await withPrismaErrorHandling(async () => {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				status: true,
				role: true,
			},
		});

		if (!user) {
			return {
				exists: false,
				id: -1,
				status: 'banned' as const,
				role: 'author' as const,
			};
		}

		return {
			exists: true,
			id: user.id,
			status: user.status,
			role: user.role,
		};
	});
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
