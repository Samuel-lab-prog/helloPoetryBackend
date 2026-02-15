import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { PoemsContractForRecomendationEngine } from '@Domains/feed-engine/ports/ExternalServices';
import type {
	PoemVisibility,
	PoemModerationStatus,
	PoemStatus,
} from '../../Enums';

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	status: PoemStatus;
	isCommentable: boolean;
};

async function getPoemsByAuthorIds(params: {
	authorIds: number[];
	limit?: number;
	offset?: number;
}) {
	const { authorIds, limit, offset } = params;

	return await withPrismaErrorHandling(async () => {
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

async function getPublicPoems(params: { limit: number; offset?: number }) {
	const { limit, offset } = params;
	return await withPrismaErrorHandling(async () => {
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

function getPoemsByIds(params: { ids: number[] }) {
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
				createdAt: true,
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

export const poemsServicesForRecomendationEngine: PoemsContractForRecomendationEngine =
	{
		getPoemsByAuthorIds,
		getPublicPoems,
		getPoemsByIds,
	};
