import { prisma } from '@Prisma/PrismaClient';
import {
	withPrismaErrorHandling,
	withPrismaResult,
} from '@Prisma/PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/commands';
import type {
	BannedUserResponse,
	ModeratePoemResult,
	SuspendedUserResponse,
} from '../../ports/models';

import {
	banSelect,
	fromRawToBannedUser,
	fromRawToSuspendedUser,
	poemModerationSelect,
	suspensionSelect,
} from './selects';

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

export function updatePoemModerationStatus(params: {
	poemId: number;
	moderationStatus: ModeratePoemResult['moderationStatus'];
}) {
	return withPrismaResult(async () => {
		const rs = await prisma.poem.update({
			where: { id: params.poemId, deletedAt: null },
			data: { moderationStatus: params.moderationStatus },
			select: poemModerationSelect,
		});

		return {
			id: rs.id,
			moderationStatus: rs.moderationStatus,
		};
	});
}

export const commandsRepository: CommandsRepository = {
	createBan,
	createSuspension,
	updatePoemModerationStatus,
};
