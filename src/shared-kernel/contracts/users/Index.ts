import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { UsersServicesForModeration } from '@Domains/moderation/ports/UsersServices';
import type { UsersServicesForPoems } from '@Domains/poems-management/ports/UsersServices';
import type {
	AuthRepository,
	ClientAuthCredentials,
} from '@GenericSubdomains/authentication/ports/AuthRepository';

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
				id: null,
				status: null,
				role: null,
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
