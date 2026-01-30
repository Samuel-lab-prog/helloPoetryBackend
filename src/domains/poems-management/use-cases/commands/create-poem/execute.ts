import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { SlugService } from '../../../ports/SlugService';
import type { CreatePoem, InsertPoem } from '../models/Index';
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
	): Promise<{ id: number }> {
		const { data, meta } = params;

		if (meta.requesterStatus !== 'active' || meta.requesterRole === 'user') {
			throw new PoemCreationDeniedError();
		}

		const slug = slugService.generateSlug(data.title);
		const fullData: InsertPoem = { ...data, slug };

		try {
			return await commandsRepository.insertPoem(fullData);
		} catch (e) {
			if ((e as Error).message.includes('slug')) {
				throw new PoemAlreadyExistsError();
			}
			throw e;
		}
	};
}
