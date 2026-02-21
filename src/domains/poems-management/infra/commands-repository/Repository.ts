import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/Commands';
import type {
	CreatePoemDB,
	CreatePoemResult,
	UpdatePoemDB,
	UpdatePoemResult,
} from '../../ports/Models';

import { insertPoemSelect, updatePoemSelect } from './Selects';
import {
	toPrismaCreatePoemInput,
	toPrismaUpdatePoemInput,
	toCreatePoemResult,
	toUpdatePoemResult,
} from './Helpers';

function insertPoem(
	poem: CreatePoemDB,
): Promise<CommandResult<CreatePoemResult>> {
	return withPrismaResult(async () => {
		const result = await prisma.poem.create({
			select: insertPoemSelect,
			data: toPrismaCreatePoemInput(poem),
		});
		return toCreatePoemResult(result);
	});
}

function updatePoem(
	poemId: number,
	poem: UpdatePoemDB,
): Promise<CommandResult<UpdatePoemResult>> {
	return withPrismaResult(async () => {
		const updatedPoem = await prisma.poem.update({
			where: { id: poemId, deletedAt: null },
			data: toPrismaUpdatePoemInput(poem),
			select: updatePoemSelect,
		});
		return toUpdatePoemResult(updatedPoem);
	});
}

function deletePoem(poemId: number): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.poem.update({
			where: { id: poemId, deletedAt: null },
			data: { deletedAt: new Date() },
		});
		return;
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
	updatePoem,
	deletePoem,
};
