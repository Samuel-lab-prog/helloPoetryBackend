import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/QueriesRepository';
import type {
	UserBan,
	UserSuspension,
} from '../../use-cases/commands/models/Index';

export function selectActiveBanByUserId(params: {
	userId: number;
}): Promise<UserBan | null> {
	const { userId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'BAN',
				endAt: null,
			},
			select: {
				id: true,
				userId: true,
				moderatorId: true,
				reason: true,
				startAt: true,
				endAt: true,
			},
		});
	});
}

export function selectActiveSuspensionByUserId(params: {
	userId: number;
}): Promise<UserSuspension | null> {
	const { userId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'SUSPENSION',
				endAt: null,
			},
			select: {
				id: true,
				userId: true,
				moderatorId: true,
				reason: true,
				startAt: true,
			},
		});
	});
}

export const queriesRepository: QueriesRepository = {
	selectActiveBanByUserId,
	selectActiveSuspensionByUserId,
};
