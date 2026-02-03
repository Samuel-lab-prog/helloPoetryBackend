import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	InsertPoemDB,
	PoemCreationResult,
	UpdatePoem,
} from '../../use-cases/commands/Models';
import { insertPoemSelect } from '../queries-repository/Selects';

function insertPoem(
	data: InsertPoemDB,
): Promise<CommandResult<PoemCreationResult>> {
	return withPrismaResult(() => {
		const tags = data.tags?.length
			? data.tags.map((tag) => ({
					where: { name: tag },
					create: { name: tag },
				}))
			: undefined;

		return prisma.poem.create({
			select: insertPoemSelect,
			data: {
				title: data.title,
				content: data.content,
				slug: data.slug,
				excerpt: data.excerpt,
				isCommentable: data.isCommentable ?? true,
				authorId: data.authorId,
				addresseeId: data.addresseeId,
				toPoemId: data.toPoemId,
				visibility: data.visibility,
				status: data.status,
				...(tags && { tags: { connectOrCreate: tags } }),
			},
		});
	});
}

function updatePoem(
	poemId: number,
	data: UpdatePoem & { slug: string },
): Promise<CommandResult<UpdatePoem>> {
	return withPrismaResult(async () => {
		const poem = await prisma.poem.update({
			where: { id: poemId },
			data: {
				title: data.title,
				content: data.content,
				slug: data.slug,
				excerpt: data.excerpt,
				isCommentable: data.isCommentable,
				visibility: data.visibility,
				status: data.status,
				tags: {
					set: [],
					connectOrCreate: data.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
			},
			select: {
				title: true,
				content: true,
				excerpt: true,
				isCommentable: true,
				visibility: true,
				status: true,
				slug: true,
				tags: true,
			},
		});

		return {
			...poem,
			tags: poem.tags.map((tag) => tag.name),
		};
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
	updatePoem,
};
