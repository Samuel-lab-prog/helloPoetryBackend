import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/CommandsRepository';

import type { InsertPoem } from '../../use-cases/commands/models/Index';

function insertPoem(data: InsertPoem): Promise<{ id: number }> {
	return withPrismaErrorHandling(async () => {
		const tags =
			data.tags && data.tags.length > 0
				? data.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					}))
				: [];

		const rs = await prisma.poem.create({
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
				toUserId: data.toUserId,
				toPoemId: data.toPoemId,

				...(tags.length > 0 && {
					tags: {
						connectOrCreate: tags,
					},
				}),
			},
		});

		return { id: rs.id };
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
};
