import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/Commands';
import type { PoemLike, PoemComment } from '../../use-cases/Models';

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

export function deletePoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<PoemLike> {
	const { userId, poemId } = params;

	return withPrismaErrorHandling(() => {
		return prisma.poemLike.delete({
			where: {
				userId_poemId: {
					userId,
					poemId,
				},
			},
		});
	});
}

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

// ----------------------------------------
// Poem Comments
// ----------------------------------------

export function createPoemComment(params: {
	userId: number;
	poemId: number;
	content: string;
}): Promise<PoemComment> {
	const { userId, poemId, content } = params;
	return withPrismaErrorHandling(async () => {
		const comment = await prisma.comment.create({
			data: {
				authorId: userId,
				poemId,
				content,
			},
		});
		return {
			id: comment.id,
			content: comment.content,
			createdAt: comment.createdAt,
			status: comment.status,
			userId: comment.authorId,
			poemId: comment.poemId,
			parentId: comment.parentId,
		};
	});
}

export function deletePoemComment(params: {
	commentId: number;
}): Promise<void> {
	const { commentId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.comment.delete({
			where: { id: commentId },
		});
	});
}

export const commandsRepository: CommandsRepository = {
	findPoemLike,
	createPoemLike,
	deletePoemLike,
	createPoemComment,
	deletePoemComment,
};
