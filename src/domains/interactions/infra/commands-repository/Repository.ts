import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/Commands';
import type { PoemLike, PoemComment } from '../../ports/Models';

function createPoemLike(params: {
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

function deletePoemLike(params: {
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

function createPoemComment(params: {
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

function deletePoemComment(params: { commentId: number }): Promise<void> {
	const { commentId } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.comment.delete({
			where: { id: commentId },
		});
	});
}

function createCommentReply(params: {
	userId: number;
	parentCommentId: number;
	content: string;
}): Promise<PoemComment> {
	const { userId, parentCommentId, content } = params;
	return withPrismaErrorHandling(async () => {
		const parentComment = await prisma.comment.findUnique({
			where: { id: parentCommentId },
		});

		if (!parentComment) throw new Error('Parent comment not found');

		const reply = await prisma.comment.create({
			data: {
				authorId: userId,
				poemId: parentComment.poemId,
				content,
				parentId: parentCommentId,
			},
		});
		return {
			id: reply.id,
			content: reply.content,
			createdAt: reply.createdAt,
			userId: reply.authorId,
			poemId: reply.poemId,
			parentId: reply.parentId,
			status: reply.status,
		};
	});
}

export const commandsRepository: CommandsRepository = {
	createPoemLike,
	deletePoemLike,
	createPoemComment,
	deletePoemComment,
	createCommentReply,
};
