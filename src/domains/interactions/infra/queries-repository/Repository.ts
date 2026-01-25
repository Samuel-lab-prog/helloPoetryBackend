import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/QueriesRepository';
import type { PoemComment } from '../../use-cases/commands/models/Index';

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

export const queriesRepository: QueriesRepository = {
	selectCommentById,
};
