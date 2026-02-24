import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/Queries';
import type { PoemComment } from '../../ports/Models';
import type { CommentSelect } from '@PrismaGenerated/models';

const poemCommentSelect: CommentSelect = {
	id: true,
	content: true,
	authorId: true,
	poemId: true,
	createdAt: true,
	parentId: true,
	status: true,
	author: {
		select: {
			id: true,
			nickname: true,
			avatarUrl: true,
		},
	},
};

export function selectCommentById(params: {
	commentId: number;
	currentUserId: number;
}): Promise<PoemComment | null> {
	const { commentId, currentUserId } = params;

	return withPrismaErrorHandling(async () => {
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: poemCommentSelect,
		});

		if (!comment) return null;

		const aggregateChildrenCount = await prisma.comment.count({
			where: { parentId: comment.id },
		});

		const likesCount = await prisma.commentLike.count({
			where: { commentId: comment.id },
		});

		const liked = await prisma.commentLike.findUnique({
			where: {
				userId_commentId: { userId: currentUserId, commentId: comment.id },
			},
		});

		return {
			id: comment.id,
			content: comment.content,
			poemId: comment.poemId,
			parentId: comment.parentId,
			status: comment.status,
			createdAt: comment.createdAt,
			aggregateChildrenCount,
			likesCount,
			likedByCurrentUser: Boolean(liked),
			author: {
				id: comment.author.id,
				nickname: comment.author.nickname,
				avatarUrl: comment.author.avatarUrl,
			},
		};
	});
}

export function selectCommentsByPoemId(params: {
	poemId: number;
	currentUserId?: number;
	parentId?: number;
}): Promise<PoemComment[]> {
	const { poemId, currentUserId, parentId } = params;

	return withPrismaErrorHandling(async () => {
		// 1️⃣ Buscar comentários com dados do autor
		const comments = await prisma.comment.findMany({
			where: {
				poemId,
				parentId: parentId ?? null, // garante que comentários principais sejam buscados corretamente
			},
			orderBy: { createdAt: 'desc' },
			select: poemCommentSelect,
		});

		const commentIds = comments.map((c) => c.id);
		if (commentIds.length === 0) return [];

		// 2️⃣ Contagem de replies
		const repliesCounts = await prisma.comment.groupBy({
			by: ['parentId'],
			where: { parentId: { in: commentIds } },
			_count: { id: true },
		});
		const repliesMap = new Map(
			repliesCounts.map((r) => [r.parentId!, r._count.id]),
		);

		// 3️⃣ Contagem de likes
		const likesCounts = await prisma.commentLike.groupBy({
			by: ['commentId'],
			where: { commentId: { in: commentIds } },
			_count: { userId: true },
		});
		const likesMap = new Map(
			likesCounts.map((l) => [l.commentId, l._count.userId]),
		);

		// 4️⃣ Likes do usuário atual
		let likedMap = new Map<number, boolean>();
		if (currentUserId) {
			const likedComments = await prisma.commentLike.findMany({
				where: {
					commentId: { in: commentIds },
					userId: currentUserId,
				},
				select: { commentId: true },
			});
			// ⚡ Corrige BigInt/number mismatch
			likedMap = new Map(likedComments.map((c) => [Number(c.commentId), true]));
		}

		// 5️⃣ Mapear para PoemComment
		return comments.map((c) => ({
			id: c.id,
			content: c.content,
			poemId: c.poemId,
			parentId: c.parentId,
			status: c.status,
			createdAt: c.createdAt,
			aggregateChildrenCount: repliesMap.get(c.id) ?? 0,
			likesCount: likesMap.get(c.id) ?? 0,
			likedByCurrentUser: likedMap.get(c.id) ?? false,
			author: {
				id: c.author.id,
				nickname: c.author.nickname,
				avatarUrl: c.author.avatarUrl,
			},
		}));
	});
}

export function selectPoemLike(params: {
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
		});
		return !!like;
	});
}

export function selectCommentLike(params: {
	userId: number;
	commentId: number;
}): Promise<boolean> {
	const { userId, commentId } = params;
	return withPrismaErrorHandling(async () => {
		const like = await prisma.commentLike.findUnique({
			where: {
				userId_commentId: {
					userId,
					commentId,
				},
			},
		});
		return !!like;
	});
}

export const queriesRepository: QueriesRepository = {
	selectCommentById,
	selectCommentsByPoemId,
	selectPoemLike,
	selectCommentLike,
};
