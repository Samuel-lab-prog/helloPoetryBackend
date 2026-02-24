import { prisma } from '@Prisma/prismaClient';
import { withPrismaErrorHandling } from '@Prisma/prismaErrorHandler';

import type { QueriesRepository } from '../../ports/Queries';
import type {
	MyPoem,
	AuthorPoem,
	PoemPreviewPage,
	SavedPoem,
	PoemCollection,
} from '../../ports/Models';

import {
	authorPoemSelect,
	myPoemSelect,
	poemPreviewSelect,
	savedPoemSelect,
} from './selects';
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

function selectSavedPoems(requesterId: number): Promise<SavedPoem[]> {
	return withPrismaErrorHandling(async () => {
		const savedPoems = await prisma.savedPoem.findMany({
			where: { userId: requesterId },
			select: savedPoemSelect,
		});

		return savedPoems.map((savedPoem) => ({
			id: savedPoem.poemId,
			savedAt: savedPoem.createdAt,
			poemId: savedPoem.poemId,
			title: savedPoem.poem.title,
			slug: savedPoem.poem.slug,
		}));
	});
}

function selectSavedPoem(params: {
	poemId: number;
	userId: number;
}): Promise<SavedPoem | null> {
	return withPrismaErrorHandling(async () => {
		const savedPoem = await prisma.savedPoem.findFirst({
			where: {
				userId: params.userId,
				poemId: params.poemId,
			},
			select: savedPoemSelect,
		});
		if (!savedPoem) return null;

		return {
			id: savedPoem.poemId,
			savedAt: savedPoem.createdAt,
			poemId: savedPoem.poemId,
			title: savedPoem.poem.title,
			slug: savedPoem.poem.slug,
		};
	});
}

function selectCollections(requesterId: number): Promise<PoemCollection[]> {
	return withPrismaErrorHandling(async () => {
		const collections = await prisma.collection.findMany({
			where: { userId: requesterId },
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				name: true,
				description: true,
				items: {
					select: {
						poem: {
							select: {
								id: true,
								title: true,
								slug: true,
							},
						},
					},
				},
			},
		});

		return collections.map((collection) => ({
			createdAt: collection.createdAt,
			updatedAt: collection.updatedAt,
			description: collection.description,
			id: collection.id,
			name: collection.name,
			poemIds: collection.items.map((item) => item.poem.id),
		}));
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
	selectPoems,
	selectSavedPoems,
	selectSavedPoem,
	selectCollections,
};
