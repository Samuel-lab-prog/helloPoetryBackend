import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	CreatePoemDB,
	CreatePoemResult,
	UpdatePoem,
} from '../../use-cases/commands/Models';

import { insertPoemSelect } from '../queries-repository/Selects';

function insertPoem(
	data: CreatePoemDB,
): Promise<CommandResult<CreatePoemResult>> {
	return withPrismaResult(() => {
		const tags = data.tags?.length
			? data.tags.map((tag) => ({
					where: { name: tag },
					create: { name: tag },
				}))
			: undefined;

		const dedications = data.dedicationUserIds?.length
			? data.dedicationUserIds.map((userId) => ({
					toUser: {
						connect: { id: userId },
					},
				}))
			: undefined;

		return prisma.poem.create({
			select: {
				...insertPoemSelect,
				visibility: true,
				status: true,
				moderationStatus: true,
			},
			data: {
				title: data.title,
				content: data.content,
				slug: data.slug,
				excerpt: data.excerpt,
				isCommentable: data.isCommentable ?? true,
				authorId: data.authorId,
				visibility: data.visibility,
				status: data.status,

				...(tags && { tags: { connectOrCreate: tags } }),

				...(dedications && {
					dedications: {
						create: dedications,
					},
				}),
			},
		});
	});
}

function updatePoem(
	poemId: number,
	data: UpdatePoem & { slug: string },
): Promise<CommandResult<UpdatePoem>> {
	return withPrismaResult(async () => {
		const tags = data.tags
			? {
					set: [],
					connectOrCreate: data.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				}
			: undefined;

		const dedications = data.dedicationUserIds
			? {
					deleteMany: {},
					create: data.dedicationUserIds.map((userId) => ({
						toUser: {
							connect: { id: userId },
						},
					})),
				}
			: undefined;

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

				...(tags && { tags }),
				...(dedications && { dedications }),
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
