import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { SlugService } from '../../../ports/SlugService';
import type { CreatePoem, InsertPoem, PoemInsertResult } from '../models/Index';
import { PoemCreationDeniedError, PoemAlreadyExistsError } from '../Errors';
import type { UserStatus, UserRole } from '@SharedKernel/Enums';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
}

interface CreatePoemParams {
	data: CreatePoem;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
}

export function createPoemFactory(deps: Dependencies) {
	const { commandsRepository, slugService } = deps;

	return async function createPoem(
		params: CreatePoemParams,
	): Promise<PoemInsertResult> {
		const { data, meta } = params;

		if (meta.requesterStatus !== 'active') {
			throw new PoemCreationDeniedError();
		}

		const slug = slugService.generateSlug(data.title);
		const fullData: InsertPoem = { ...data, slug };

		const result = await commandsRepository.insertPoem(fullData);

		if (result.ok === true) {
			return result.data;
		}

		if (result.ok === false && result.code === 'CONFLICT') {
			throw new PoemAlreadyExistsError();
		}

		throw result.error;
	};
}
