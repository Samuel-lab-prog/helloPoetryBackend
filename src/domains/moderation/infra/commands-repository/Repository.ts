import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	UserBan,
	UserSuspension,
} from '../../use-cases/commands/models/Index';

export function createBan(params: {
	userId: number;
	reason: string;
	moderatorId: number;
}): Promise<UserBan> {
	const { userId, reason, moderatorId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.userSanction.create({
			data: {
				userId,
				moderatorId,
				reason,
				type: 'BAN',
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

export function createSuspension(params: {
	userId: number;
	reason: string;
	moderatorId: number;
}): Promise<UserSuspension> {
	const { userId, reason, moderatorId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.userSanction.create({
			data: {
				userId,
				moderatorId,
				reason,
				type: 'SUSPENSION',
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

export const commandsRepository: CommandsRepository = {
	createBan,
	createSuspension,
};
