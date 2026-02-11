import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/Commands';
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../../use-cases/Models';

import {
	banSelect,
	fromRawToBannedUser,
	fromRawToSuspendedUser,
	suspensionSelect,
} from './selects/Index';

export function createBan(params: {
	userId: number;
	reason: string;
	moderatorId: number;
}): Promise<BannedUserResponse> {
	const { userId, reason, moderatorId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.create({
			data: {
				userId,
				moderatorId,
				reason,
				type: 'ban',
			},
			select: banSelect,
		});

		return fromRawToBannedUser(rs);
	});
}

export function createSuspension(params: {
	userId: number;
	reason: string;
	moderatorId: number;
	endAt: Date;
}): Promise<SuspendedUserResponse> {
	const { userId, reason, moderatorId, endAt } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.create({
			data: {
				userId,
				moderatorId,
				reason,
				endAt,
				type: 'suspension',
			},
			select: suspensionSelect,
		});
		return fromRawToSuspendedUser(rs);
	});
}

export const commandsRepository: CommandsRepository = {
	createBan,
	createSuspension,
};
