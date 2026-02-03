import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/QueriesRepository';
import type { MyPoem, AuthorPoem } from '../../use-cases/queries/Models';

import { authorPoemSelect, myPoemSelect } from './Selects';

//------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------

function getFriendIdsFromRelations(poemAuthor: {
	friendshipsFrom: { userBId: number }[] | null;
	friendshipsTo: { userAId: number }[] | null;
}): number[] {
	return [
		...(poemAuthor.friendshipsFrom?.map((f) => f.userBId) || []),
		...(poemAuthor.friendshipsTo?.map((f) => f.userAId) || []),
	];
}

function calculateStats(poem: {
	_count: { poemLikes: number; comments: number };
}) {
	return {
		likesCount: poem._count.poemLikes,
		commentsCount: poem._count.comments,
	};
}

//------------------------------------------------------------------------

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
			toUserIds: poem.dedications.map((dedication) => ({
				...dedication.toUser,
				friendIds: getFriendIdsFromRelations(dedication.toUser),
			})),
			stats: calculateStats(poem),
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
			stats: calculateStats(poem),
			author: {
				...poem.author,
				friendIds: getFriendIdsFromRelations(poem.author),
			},
		}));
	});
}

function selectPoemById({
	poemId,
}: {
	poemId: number;
}): Promise<AuthorPoem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId },
			select: authorPoemSelect,
		});

		if (!poem) return null;

		const poemDetails: AuthorPoem = {
			...poem,
			author: {
				...poem.author,
				friendIds: getFriendIdsFromRelations(poem.author),
			},
			stats: calculateStats(poem),
		};
		return poemDetails;
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
};
