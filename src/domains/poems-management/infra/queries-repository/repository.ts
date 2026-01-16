import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

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
				status: 'published',
				visibility: 'public',
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
		}));
	});
}

export const QueriesRepository: PoemQueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
};
