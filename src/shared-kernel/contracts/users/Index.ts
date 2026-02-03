import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { UserStatus, UserRole } from '../../Enums';

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

export interface UsersContract {
	getUserBasicInfo(userId: number): Promise<{
		exists: boolean;
		id: number | null;
		status: UserStatus | null;
		role: UserRole | null;
	}>;
}

export const usersContract: UsersContract = {
	getUserBasicInfo,
};