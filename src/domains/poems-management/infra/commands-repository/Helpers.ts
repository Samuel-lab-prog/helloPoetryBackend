import type { Prisma } from '@PrismaGenerated/browser';

import type {
	CreatePoemResult,
	UpdatePoemResult,
	CreatePoemDB,
	UpdatePoemDB,
} from '../../use-cases/Models';

import { insertPoemSelect, updatePoemSelect } from './Selects';

export function toPrismaCreatePoemInput(
	poem: CreatePoemDB,
): Prisma.PoemCreateInput {
	const { toUserIds, tags, authorId, ...poemData } = poem;

	return {
		...poemData,

		author: {
			connect: { id: authorId },
		},

		tags: tags ? connectOrCreateTags(tags) : undefined,
		dedications: toUserIds ? createDedications(toUserIds) : undefined,
	};
}

export function toPrismaUpdatePoemInput(
	poem: UpdatePoemDB,
): Prisma.PoemUpdateInput {
	const { toUserIds, tags, ...poemData } = poem;

	return {
		...poemData,

		tags: tags ? upsertTags(tags) : undefined,
		dedications: toUserIds ? upsertDedications(toUserIds) : undefined,
	};
}

type PoemWithDedications = {
	dedications: { toUserId: number }[];
};

function extractToUserIds(dedications: { toUserId: number }[]): number[] {
	return dedications.map((d) => d.toUserId);
}

function mapPoemResult<T extends PoemWithDedications>(prismaPoem: T) {
	return {
		...prismaPoem,
		toUserIds: extractToUserIds(prismaPoem.dedications),
	};
}

export function toCreatePoemResult(
	prismaPoem: Prisma.PoemGetPayload<{
		select: typeof insertPoemSelect;
	}>,
): CreatePoemResult {
	return mapPoemResult(prismaPoem);
}

export function toUpdatePoemResult(
	prismaPoem: Prisma.PoemGetPayload<{
		select: typeof updatePoemSelect;
	}>,
): UpdatePoemResult {
	return mapPoemResult(prismaPoem);
}

function buildTagsConnectOrCreate(tags: string[]) {
	return tags.map((tag) => ({
		where: { name: tag },
		create: { name: tag },
	}));
}

function buildDedicationsCreate(toUserIds: number[]) {
	return toUserIds.map((userId) => ({
		toUser: {
			connect: { id: userId },
		},
	}));
}

function connectOrCreateTags(
	tags: string[],
): Prisma.TagCreateNestedManyWithoutPoemsInput {
	return {
		connectOrCreate: buildTagsConnectOrCreate(tags),
	};
}

function upsertTags(
	tags: string[],
): Prisma.TagUpdateManyWithoutPoemsNestedInput {
	return {
		set: [],
		connectOrCreate: buildTagsConnectOrCreate(tags),
	};
}

function createDedications(
	toUserIds: number[],
): Prisma.PoemDedicationCreateNestedManyWithoutPoemInput {
	return {
		create: buildDedicationsCreate(toUserIds),
	};
}

function upsertDedications(
	toUserIds: number[],
): Prisma.PoemDedicationUpdateManyWithoutPoemNestedInput {
	return {
		deleteMany: {
			toUserId: { notIn: toUserIds },
		},
		create: buildDedicationsCreate(toUserIds),
	};
}
