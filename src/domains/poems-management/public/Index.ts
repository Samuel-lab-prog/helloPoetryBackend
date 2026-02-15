import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '../use-cases/Models';
import { prisma } from '@Prisma/PrismaClient';

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	status: PoemStatus;
	isCommentable: boolean;
};

export interface PoemsPublicContract {
	selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo>;
}

async function selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo> {
	return await withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId, deletedAt: null },
			select: {
				id: true,
				authorId: true,
				visibility: true,
				moderationStatus: true,
				status: true,
				isCommentable: true,
			},
		});

		if (!poem) {
			return {
				id: -1,
				exists: false,
				authorId: -1,
				visibility: 'private' as const,
				moderationStatus: 'pending' as const,
				status: 'draft' as const,
				isCommentable: false,
			};
		}

		return {
			exists: true,
			authorId: poem.authorId,
			visibility: poem.visibility,
			moderationStatus: poem.moderationStatus,
			status: poem.status,
			isCommentable: poem.isCommentable,
			id: poem.id,
		};
	});
}

export const poemsPublicContract: PoemsPublicContract = {
	selectPoemBasicInfo,
};
