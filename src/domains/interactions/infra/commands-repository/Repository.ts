import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/CommandsRepository';
import type { PoemLike } from '../../use-cases/commands/models/Index';

export function findPoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<PoemLike | null> {
	const { userId, poemId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.poemLike.findUnique({
			where: {
				userId_poemId: {
					userId,
					poemId,
				},
			},
		});
	});
}

export function existsPoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<boolean> {
	const { userId, poemId } = params;

	return withPrismaErrorHandling(async () => {
		const like = await prisma.poemLike.findUnique({
			where: {
				userId_poemId: {
					userId,
					poemId,
				},
			},
			select: { userId: true },
		});

		return like !== null;
	});
}

export function createPoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<PoemLike> {
	const { userId, poemId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.poemLike.create({
			data: {
				userId,
				poemId,
			},
		});
	});
}

export const commandsRepository: CommandsRepository = {
	findPoemLike,
	existsPoemLike,
	createPoemLike,
};
