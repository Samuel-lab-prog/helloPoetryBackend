import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { PoemQueriesRepository } from '../../ports/QueriesRepository';

import type {
	SelectAuthorPoemParams,
	SelectAuthorPoemListParams,
} from '../../ports/PoemQueryParams';

import { authorPoemSelect } from './helpers';

import type { AuthorPoemListItem } from '../../use-cases/queries/read-models/AuthorPoemListItem';

function selectAuthorPoem(
	params: SelectAuthorPoemParams,
): Promise<AuthorPoemListItem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: params.poemId },
			select: authorPoemSelect,
		});

		if (!poem) {
			return null;
		}

		return {
			...poem,
			stats: {
				likesCount: poem._count.poemLikes,
				commentsCount: poem._count.comments,
			},
		};
	});
}

function selectAuthorPoems(
	params: SelectAuthorPoemListParams,
): Promise<AuthorPoemListItem[]> {
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
		}));
	});
}

export const QueriesRepository: PoemQueriesRepository = {
	selectAuthorPoem,
	selectAuthorPoemList: selectAuthorPoems,
};
