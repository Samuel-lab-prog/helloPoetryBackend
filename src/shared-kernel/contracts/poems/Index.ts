import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { PoemVisibility } from '../../Enums';

async function getPoemInteractionInfo(poemId: number) {
	return await withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findUnique({
			where: { id: poemId },
			select: {
				id: true,
				authorId: true,
				visibility: true,
			},
		});

		if (!poem) {
			return {
				exists: false,
				authorId: null,
				visibility: null,
			};
		}

		return {
			exists: true,
			authorId: poem.authorId,
			visibility: poem.visibility,
		};
	});
}

export interface PoemsContract {
	getPoemInteractionInfo(poemId: number): Promise<{
		exists: boolean;
		authorId: number | null;
		visibility: PoemVisibility | null;
	}>;
}

export const poemsContract: PoemsContract = {
	getPoemInteractionInfo,
};
