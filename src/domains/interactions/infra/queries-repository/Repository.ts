import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/Queries';
import type { PoemComment } from '../../use-cases/Models';

export function selectCommentById(params: {
	commentId: number;
}): Promise<PoemComment | null> {
	const { commentId } = params;
	return withPrismaErrorHandling(async () => {
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: {
				id: true,
				content: true,
				authorId: true,
				poemId: true,
				createdAt: true,
			},
		});
		if (!comment) {
			return null;
		}
		return {
			id: comment.id,
			content: comment.content,
			userId: comment.authorId,
			poemId: comment.poemId,
			createdAt: comment.createdAt,
		};
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

export function findCommentsByPoemId(params: {
	poemId: number;
}): Promise<PoemComment[]> {
	const { poemId } = params;
	return withPrismaErrorHandling(async () => {
		const rs = await prisma.comment.findMany({
			where: { poemId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				content: true,
				authorId: true,
				poemId: true,
				createdAt: true,
			},
		});
		return rs.map((comment) => ({
			id: comment.id,
			content: comment.content,
			userId: comment.authorId,
			poemId: comment.poemId,
			createdAt: comment.createdAt,
		}));
	});
}

export const queriesRepository: QueriesRepository = {
	selectCommentById,
	findCommentsByPoemId,
	existsPoemLike,
};
