import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/Queries';
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../../use-cases/Models';
import {
	fromRawToSuspendedUser,
	suspensionSelect,
} from '../commands-repository/selects/CreateSuspension';
import {
	banSelect,
	fromRawToBannedUser,
} from '../commands-repository/selects/CreateBan';

export function selectActiveBanByUserId(params: {
	userId: number;
}): Promise<BannedUserResponse | null> {
	const { userId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'ban',
				endAt: null,
			},
			select: banSelect,
		});
		return rs ? fromRawToBannedUser(rs) : null;
	});
}

export function selectActiveSuspensionByUserId(params: {
	userId: number;
}): Promise<SuspendedUserResponse | null> {
	const { userId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'suspension',
				endAt: null,
			},
			select: suspensionSelect,
		});

		return rs ? fromRawToSuspendedUser(rs) : null;
	});
}

export const queriesRepository: QueriesRepository = {
	selectActiveBanByUserId,
	selectActiveSuspensionByUserId,
};
