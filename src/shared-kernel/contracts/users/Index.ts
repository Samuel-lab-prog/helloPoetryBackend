import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { UsersServicesForModeration } from '@Domains/moderation/ports/ExternalServices';
import type { UsersServicesForPoems } from '@Domains/poems-management/ports/ExternalServices';
import type { ClientAuthCredentials } from '@GenericSubdomains/authentication/use-cases/Models';
import type { AuthRepository } from '@GenericSubdomains/authentication/ports/AuthRepository';
import type { UsersContractForInteractions } from '@Domains/interactions/ports/ExternalServices';
import type { UserStatus, UserRole } from '../../Enums';

export type UserBasicInfo = {
	exists: boolean;
	id: number;
	status: UserStatus;
	role: UserRole;
};

async function getUserBasicInfo(userId: number) {
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

export const usersContract: UsersServicesForModeration = {
	getUserBasicInfo,
};

export const usersContractForPoems: UsersServicesForPoems = {
	getUserBasicInfo,
};

export const usersContractForInteractions: UsersContractForInteractions = {
	getUserBasicInfo,
};

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

export const usersContractForAuth: AuthRepository = {
	findClientByEmail: selectAuthUserByEmail,
};
