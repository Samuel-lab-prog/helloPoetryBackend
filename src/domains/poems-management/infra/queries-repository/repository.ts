/* eslint-disable max-nested-callbacks */
import { prisma } from '@GenericSubdomains/persistance/prisma/PrismaClient';
import { withPrismaErrorHandling } from '@prisma/error-handling/HandlePrismaErrors';

import type { PoemQueriesRepository } from '../../ports/QueriesRepository';
import type {
	SelectAuthorPoemsParams,
	SelectMyPoemsParams,
} from '../../ports/PoemQueryParams';

import { authorPoemSelect, myPoemSelect } from './helpers';

import type { MyPoem } from '../../use-cases/queries/read-models/MyPoem';
import type { AuthorPoem } from '../../use-cases/queries/read-models/AuthorPoem';

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

export const QueriesRepository: PoemQueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
};
