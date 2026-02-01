import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/CommandsRepository';

import type { InsertPoem } from '../../use-cases/commands/models/Index';

function insertPoem(data: InsertPoem): Promise<{ id: number }> {
	return withPrismaErrorHandling(() => {
		const tags =
			data.tags && data.tags.length > 0
				? data.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					}))
				: [];

		return prisma.poem.create({
			select: {
				id: true,
			},
			data: {
				title: data.title,
				content: data.content,
				slug: data.slug,
				excerpt: data.excerpt,
				isCommentable: data.isCommentable ?? true,
				authorId: data.authorId,
				toUserId: data.addresseeId,
				toPoemId: data.toPoemId,

				...(tags.length > 0 && {
					tags: {
						connectOrCreate: tags,
					},
				}),
			},
		});
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
};
