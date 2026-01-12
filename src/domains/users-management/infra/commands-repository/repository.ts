import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { UserCommandsRepository } from '../../commands/ports/CommandsRepository';
import type { InsertUser } from '../../commands/commands-models/Insert';
import type { UpdateUserData } from '../../commands/commands-models/Update';

function insertUser(user: InsertUser): Promise<{ id: number } | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.create({
			data: user,
			select: { id: true },
		});
	});
}

function softDeleteUser(id: number): Promise<{ id: number } | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
			select: { id: true },
		});
	});
}

function updateUser(
	userId: number,
	userData: UpdateUserData,
): Promise<{ id: number } | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.update({
			where: { id: userId },
			data: userData,
			select: { id: true },
		});
	});
}

export const CommandsRepository: UserCommandsRepository = {
	insertUser,
	softDeleteUser,
	updateUser,
};
