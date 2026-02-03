import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/QueriesRepository';

import { authorPoemSelect, myPoemSelect, fullPoemSelect } from './Selects';

import type {
	MyPoem,
	AuthorPoem,
	FullPoem,
} from '../../use-cases/queries/Models';

function selectMyPoems(params: { requesterId: number }): Promise<MyPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId: params.requesterId,
			},
			select: myPoemSelect,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return poems.map((poem) => ({
			...poem,
			stats: {
				likesCount: poem._count.poemLikes,
				commentsCount: poem._count.comments,
			},
		}));
	});
}

function selectAuthorPoems(params: {
	authorId: number;
}): Promise<AuthorPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId: params.authorId,
			},
			select: authorPoemSelect,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return poems.map((poem) => ({
			...poem,
			stats: {
				likesCount: poem._count.poemLikes,
				commentsCount: poem._count.comments,
			},
			author: {
				...poem.author,
				friendsIds: [
					...poem.author.friendshipsTo.map((f) => f.userAId),
					...poem.author.friendshipsFrom.map((f) => f.userBId),
				],
			},
		}));
	});
}

function selectPoemById({
	poemId,
}: {
	poemId: number;
}): Promise<FullPoem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId },
			select: fullPoemSelect,
		});

		if (!poem) return null;

		const friendsIds = [
			...(poem.author.friendshipsFrom?.map((f) => f.userBId) || []),
			...(poem.author.friendshipsTo?.map((f) => f.userAId) || []),
		];

		const poemDetails: FullPoem = {
			...poem,
			excerpt: poem.excerpt ?? null,
			author: {
				id: poem.author.id,
				name: poem.author.name,
				nickname: poem.author.nickname,
				avatarUrl: poem.author.avatarUrl,
				friendsIds,
			},
			dedicatedToUser: poem.addresseedUser ?? null,
			dedicatedToPoem: poem.toPoem ?? null,
			tags: poem.tags,
			stats: {
				likesCount: poem._count.poemLikes,
				commentsCount: poem._count.comments,
			},
		};

		return poemDetails;
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
};
