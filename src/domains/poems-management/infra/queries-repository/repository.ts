import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/Queries';
import type { MyPoem, AuthorPoem } from '../../use-cases/Models';

import { authorPoemSelect, myPoemSelect } from './Selects';
import { mapPoem } from './Helpers';

export function selectMyPoems(requesterId: number): Promise<MyPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: { authorId: requesterId },
			select: myPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem));
	});
}

export function selectAuthorPoems(authorId: number): Promise<AuthorPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: { authorId },
			select: authorPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem, poem.author));
	});
}

export function selectPoemById(poemId: number): Promise<AuthorPoem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId },
			select: authorPoemSelect,
		});

		if (!poem) return null;

		return mapPoem(poem, poem.author);
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
};
