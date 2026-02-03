import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	CreatePoemDB,
	CreatePoemResult,
	UpdatePoemDB,
	UpdatePoemResult,
} from '../../use-cases/commands/Models';

import { insertPoemSelect, updatePoemSelect } from './Selects';

function connectOrCreateTags(tags?: string[]) {
	if (!tags || tags.length === 0) {
		return undefined;
	}
	const object = {
		set: [],
		connectOrCreate: tags.map((tag) => ({
			where: { name: tag },
			create: { name: tag },
		})),
	};
	return object;
}

function connectDedications(dedicationUserIds?: number[] | undefined) {
	if (!dedicationUserIds || dedicationUserIds.length === 0) {
		return undefined;
	}
	const object = dedicationUserIds.map((userId) => ({
		toUser: {
			connect: { id: userId },
		},
	}));
	return object;
}


function insertPoem(poem: CreatePoemDB): Promise<CommandResult<CreatePoemResult>> {
	return withPrismaResult(async () => {
		const tags = connectOrCreateTags(poem.tags);
		const dedications = connectDedications(poem.toUserIds);
		const result = await prisma.poem.create({
			select: insertPoemSelect,
			data: {
				...poem,
				tags,
				...(dedications && {
					dedications: {
						create: dedications,
					},
				}),
			},
		});

		return {
			...result,
			toUserIds: result.dedications.map((dedication) => dedication.toUserId),
		};
	});
}

function updatePoem(
	poemId: number,
	poem: UpdatePoemDB,
): Promise<CommandResult<UpdatePoemResult>> {
	return withPrismaResult(async () => {
		const tags = connectOrCreateTags(poem.tags);

		const dedications = poem.toUserIds
			? {
				deleteMany: {},
				create: connectDedications(poem.toUserIds),
			}
			: undefined;

		const updatedPoem = await prisma.poem.update({
			where: { id: poemId },
			data: {
				title: poem.title,
				content: poem.content,
				slug: poem.slug,
				excerpt: poem.excerpt,
				isCommentable: poem.isCommentable,
				visibility: poem.visibility,
				status: poem.status,

				...(tags && { tags }),
				...(dedications && { dedications }),
			},
			select: updatePoemSelect,
		});

		return {
			...updatedPoem,
			toUserIds: updatedPoem.dedications.map((dedication) => dedication.toUserId),
		};
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
	updatePoem,
};
