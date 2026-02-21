/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { PoemsFeedContract } from '@Domains/feed-engine/ports/ExternalServices';
import type { PoemSelect, PoemWhereInput } from '@PrismaGenerated/models';
import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '../ports/Models';

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
export const poemsPublicContract: PoemsPublicContract = {
	selectPoemBasicInfo,
};

const feedSelect: PoemSelect = {
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
};

function mapToFeedPoem(poem: any): FeedPoem {
	return {
		id: poem.id,
		content: poem.content,
		title: poem.title,
		slug: poem.slug,
		tags: poem.tags.map((t: any) => t.name),
		createdAt: poem.createdAt,
		author: {
			id: poem.author.id,
			name: poem.author.name,
			nickname: poem.author.nickname,
			avatarUrl: poem.author.avatarUrl,
		},
	};
}

function baseWhere(): PoemWhereInput {
	return {
		deletedAt: null,
		visibility: 'public',
		moderationStatus: 'approved',
		status: 'published',
	};
}

// eslint-disable-next-line require-await
async function getFeedPoemsByAuthorIds(params: {
	authorIds: number[];
	limit: number;
	cursor?: Date;
}): Promise<FeedPoem[]> {
	const { authorIds, limit, cursor } = params;

	if (authorIds.length === 0) return [];

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				...baseWhere(),
				authorId: { in: authorIds },
				...(cursor && {
					createdAt: { lt: cursor },
				}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
			select: feedSelect,
		});

		return poems.map(mapToFeedPoem);
	});
}

// eslint-disable-next-line require-await
async function getPublicFeedPoems(params: {
	limit: number;
	cursor?: Date;
	excludeAuthorIds?: number[];
	excludePoemIds?: number[];
}): Promise<FeedPoem[]> {
	const { limit, cursor, excludeAuthorIds, excludePoemIds } = params;

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				...baseWhere(),
				...(cursor && {
					createdAt: { lt: cursor },
				}),
				...(excludeAuthorIds?.length && {
					authorId: { notIn: excludeAuthorIds },
				}),
				...(excludePoemIds?.length && {
					id: { notIn: excludePoemIds },
				}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
			select: feedSelect,
		});

		return poems.map(mapToFeedPoem);
	});
}

export const poemsFeedContract: PoemsFeedContract = {
	getFeedPoemsByAuthorIds,
	getPublicFeedPoems,
};
