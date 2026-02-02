import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	InsertPoem,
	PoemInsertResult,
} from '../../use-cases/commands/models/Index';
import { insertPoemSelect } from '../queries-repository/selects';

function insertPoem(
	data: InsertPoem,
): Promise<CommandResult<PoemInsertResult>> {
	return withPrismaResult(() => {
		const tags =
			data.tags && data.tags.length > 0
				? data.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					}))
				: [];

		return prisma.poem.create({
			select: insertPoemSelect,
			data: {
				title: data.title,
				content: data.content,
				slug: data.slug,
				excerpt: data.excerpt,
				isCommentable: data.isCommentable ?? true,
				authorId: data.authorId,
				addresseeId: data.addresseeUserId,
				toPoemId: data.addresseePoemId,
				visibility: data.visibility,
				status: data.status,

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
