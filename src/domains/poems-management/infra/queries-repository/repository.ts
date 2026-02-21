import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/Queries';
import type { MyPoem, AuthorPoem, PoemPreviewPage } from '../../ports/Models';

import { authorPoemSelect, myPoemSelect, poemPreviewSelect } from './Selects';
import { mapPoem, mapPoemPreview } from './Helpers';

const DEFAULT_LIMIT = 20;

export function selectMyPoems(requesterId: number): Promise<MyPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId: requesterId,
				deletedAt: null,
			},
			select: myPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem));
	});
}

export function selectAuthorPoems(authorId: number): Promise<AuthorPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId,
				deletedAt: null,
			},
			select: authorPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem, poem.author));
	});
}

export function selectPoemById(poemId: number): Promise<AuthorPoem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findFirst({
			where: {
				id: poemId,
				deletedAt: null,
			},
			select: authorPoemSelect,
		});

		if (!poem) return null;

		return mapPoem(poem, poem.author);
	});
}

export function selectPoems(params: {
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
	sortOptions: {
		orderBy: 'createdAt' | 'title';
		orderDirection: 'asc' | 'desc';
	};
	filterOptions: {
		searchTitle?: string;
		tags?: string[];
	};
}): Promise<PoemPreviewPage> {
	const { navigationOptions, sortOptions, filterOptions } = params;

	return withPrismaErrorHandling(async () => {
		const limit = navigationOptions.limit ?? DEFAULT_LIMIT;

		const where = {
			deletedAt: null,
			...(filterOptions.searchTitle && {
				title: {
					contains: filterOptions.searchTitle,
					mode: 'insensitive' as const,
				},
			}),
			...(filterOptions.tags?.length && {
				tags: {
					some: {
						name: {
							in: filterOptions.tags,
						},
					},
				},
			}),
		};

		const poems = await prisma.poem.findMany({
			where,
			select: poemPreviewSelect,
			orderBy: {
				[sortOptions.orderBy]: sortOptions.orderDirection,
			},
			cursor: navigationOptions.cursor
				? { id: navigationOptions.cursor }
				: undefined,
			take: limit + 1,
		});

		const hasMore = poems.length > limit;
		const items = poems.slice(0, limit);

		return {
			poems: items.map((poem) => mapPoemPreview(poem)),
			hasMore,
			nextCursor: hasMore ? items[items.length - 1]!.id : null,
		};
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
	selectPoems,
};
