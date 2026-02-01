import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import { DatabaseError } from '@DatabaseError';

import type {
	CommandsRepository,
	FailureReasons,
} from '../../ports/CommandsRepository';
import type {
	UpdateUserData,
	InsertUser,
} from '../../use-cases/commands/models/Index';
import type { FullUser } from '@Domains/users-management/use-cases/queries/Index';
import { fullUserSelect } from '../read-repository/selectsModels';

async function insertUser(
	user: InsertUser,
): Promise<
	{ ok: true; data: FullUser } | { ok: false; failureReason: FailureReasons }
> {
	try {
		const result = await withPrismaErrorHandling(() => {
			return prisma.user.create({
				data: {
					nickname: user.nickname,
					email: user.email,
					passwordHash: user.passwordHash,
					name: user.name,
					bio: user.bio,
					avatarUrl: user.avatarUrl,
				},
				select: fullUserSelect,
			});
		});

		return { ok: true, data: result };
	} catch (error: unknown) {
		if (error instanceof DatabaseError) {
			if (error.message.includes('email')) {
				return { ok: false, failureReason: 'DUPLICATE_EMAIL' };
			}
			if (error.message.includes('nickname')) {
				return { ok: false, failureReason: 'DUPLICATE_NICKNAME' };
			}
			if (error.message.includes('not found')) {
				return { ok: false, failureReason: 'NOT_FOUND' };
			}
		}
		return { ok: false, failureReason: 'DB_ERROR' };
	}
}

// ----------------------------------
// UPDATE
// ----------------------------------

async function updateUser(
	userId: number,
	userData: UpdateUserData,
): Promise<
	{ data: FullUser; ok: true } | { ok: false; failureReason: FailureReasons }
> {
	try {
		const result = await withPrismaErrorHandling(() => {
			return prisma.user.update({
				where: { id: userId },
				data: userData,
				select: fullUserSelect,
			});
		});

		return { ok: true, data: result };
	} catch (error: unknown) {
		if (error instanceof DatabaseError) {
			if (error.message.includes('not found')) {
				return { ok: false, failureReason: 'NOT_FOUND' };
			}
			if (error.message.includes('email')) {
				return { ok: false, failureReason: 'DUPLICATE_EMAIL' };
			}
			if (error.message.includes('nickname')) {
				return { ok: false, failureReason: 'DUPLICATE_NICKNAME' };
			}
		}

		return { ok: false, failureReason: 'DB_ERROR' };
	}
}

// ----------------------------------
// SOFT DELETE
// ----------------------------------

async function softDeleteUser(
	id: number,
): Promise<
	{ ok: true; data: FullUser } | { ok: false; failureReason: FailureReasons }
> {
	try {
		const result = await withPrismaErrorHandling(() => {
			return prisma.user.update({
				where: { id },
				data: { deletedAt: new Date() },
				select: fullUserSelect,
			});
		});

		return { ok: true, data: result };
	} catch (error: unknown) {
		if (error instanceof DatabaseError) {
			return { ok: false, failureReason: 'NOT_FOUND' };
		}

		return { ok: false, failureReason: 'DB_ERROR' };
	}
}

// ----------------------------------

export const commandsRepository: CommandsRepository = {
	insertUser,
	updateUser,
	softDeleteUser,
};
