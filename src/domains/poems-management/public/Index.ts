import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';

import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '../use-cases/Models';

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	status: PoemStatus;
	isCommentable: boolean;
	poemTitle: string;
};

export type FeedPoem = {
	id: number;
	content: string;
	title: string;
	slug: string;
	tags: string[];
	createdAt: Date;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
	};
};

export interface PoemsPublicContract {
	selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo>;

	getPoemsByAuthorIds(params: {
		authorIds: number[];
		limit?: number;
		offset?: number;
	}): Promise<{
		poems: {
			id: number;
			authorId: number;
			createdAt: Date;
		}[];
	}>;

	getPublicPoems(params: { limit: number; offset?: number }): Promise<{
		poems: {
			id: number;
			authorId: number;
			createdAt: Date;
		}[];
	}>;

	getPoemsByIds(params: { ids: number[] }): Promise<{
		poems: FeedPoem[];
	}>;
}

function selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId, deletedAt: null },
			select: {
				id: true,
				authorId: true,
				visibility: true,
				moderationStatus: true,
				status: true,
				isCommentable: true,
				title: true,
			},
		});

		if (!poem) {
			return {
				exists: false,
				id: poemId,
				authorId: -1,
				visibility: 'private',
				moderationStatus: 'pending',
				status: 'draft',
				isCommentable: false,
				poemTitle: '',
			};
		}

		return {
			exists: true,
			id: poem.id,
			authorId: poem.authorId,
			visibility: poem.visibility,
			moderationStatus: poem.moderationStatus,
			status: poem.status,
			isCommentable: poem.isCommentable,
			poemTitle: poem.title,
		};
	});
}

function getPoemsByAuthorIds(params: {
	authorIds: number[];
	limit?: number;
	offset?: number;
}): Promise<{
	poems: {
		id: number;
		authorId: number;
		createdAt: Date;
	}[];
}> {
	const { authorIds, limit, offset } = params;

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId: { in: authorIds },
			},
			skip: offset,
			take: limit,
			select: {
				id: true,
				authorId: true,
				createdAt: true,
			},
		});

		return { poems };
	});
}

function getPublicPoems(params: { limit: number; offset?: number }): Promise<{
	poems: {
		id: number;
		authorId: number;
		createdAt: Date;
	}[];
}> {
	const { limit, offset } = params;

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			skip: offset,
			take: limit,
			select: {
				id: true,
				authorId: true,
				createdAt: true,
			},
		});

		return { poems };
	});
}

function getPoemsByIds(params: {
	ids: number[];
}): Promise<{ poems: FeedPoem[] }> {
	const { ids } = params;

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				id: { in: ids },
			},
			select: {
				id: true,
				content: true,
				title: true,
				slug: true,
				createdAt: true,
				author: {
					select: {
						id: true,
						name: true,
						nickname: true,
						avatarUrl: true,
					},
				},
				tags: {
					select: {
						name: true,
					},
				},
			},
		});

		return {
			poems: poems.map((poem) => ({
				id: poem.id,
				content: poem.content,
				title: poem.title,
				slug: poem.slug,
				tags: poem.tags.map((tag) => tag.name),
				createdAt: poem.createdAt,
				author: {
					id: poem.author.id,
					name: poem.author.name,
					nickname: poem.author.nickname,
					avatarUrl: poem.author.avatarUrl,
				},
			})),
		};
	});
}

export const poemsPublicContract: PoemsPublicContract = {
	selectPoemBasicInfo,
	getPoemsByAuthorIds,
	getPublicPoems,
	getPoemsByIds,
};
