import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { PoemQueriesRepository } from '../../ports/QueriesRepository';

import type { SelectAuthorPoemParams } from '../../ports/PoemQueryParams';

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

export const QueriesRepository: PoemQueriesRepository = {
	selectAuthorPoem,
};
