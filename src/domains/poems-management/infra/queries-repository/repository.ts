import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type { PoemQueriesRepository } from '../../ports/QueriesRepository';

import type { SelectMyPoemsParams } from '../../ports/PoemQueryParams';

import { myPoemSelect } from './helpers';

import type { MyPoem } from '../../use-cases/queries/read-models/MyPoem';

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

export const QueriesRepository: PoemQueriesRepository = {
	selectMyPoems,
};
