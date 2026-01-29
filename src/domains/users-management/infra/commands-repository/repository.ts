import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	UpdateUserData,
	InsertUser,
} from '../../use-cases/commands/models/index';

function insertUser(user: InsertUser): Promise<{ id: number } | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.create({
			data: {
				nickname: user.nickname,
				email: user.email,
				passwordHash: user.passwordHash,
				name: user.name,
				bio: user.bio,
				avatarUrl: user.avatarUrl,
			},
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

export const commandsRepository: CommandsRepository = {
	insertUser,
	softDeleteUser,
	updateUser,
};
