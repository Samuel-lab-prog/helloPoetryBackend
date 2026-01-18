/* eslint-disable max-nested-callbacks */
import { prisma } from '@GenericSubdomains/persistance/prisma/PrismaClient';
import { withPrismaErrorHandling } from '@prisma/error-handling/HandlePrismaErrors';

import type { PoemQueriesRepository } from '../../ports/QueriesRepository';
import type {
	SelectAuthorPoemsParams,
	SelectMyPoemsParams,
} from '../../ports/PoemQueryParams';

import { authorPoemSelect, myPoemSelect, fullPoemSelect } from './selects';

import type { MyPoem } from '../../use-cases/queries/read-models/MyPoem';
import type { AuthorPoem } from '../../use-cases/queries/read-models/AuthorPoem';
import type { FullPoem } from '../../use-cases/queries/read-models/FullPoem';

function selectMyPoems(params: SelectMyPoemsParams): Promise<MyPoem[]> {
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

function selectAuthorPoems(
	params: SelectAuthorPoemsParams,
): Promise<AuthorPoem[]> {
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

function selectPoemById(poemId: number): Promise<FullPoem | null> {
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
			excerpt: poem.excerpt ?? undefined,
			author: {
				id: poem.author.id,
				name: poem.author.name,
				nickname: poem.author.nickname,
				avatarUrl: poem.author.avatarUrl,
				friendsIds,
			},
			dedicatedToUser: poem.toUser ?? null,
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

export const QueriesRepository: PoemQueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
};
