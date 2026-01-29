import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { SlugService } from '../../../ports/SlugService';
import type { CreatePoem, InsertPoem } from '../models/Index';
import { PoemCreationDeniedError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
}

interface CreatePoemParams {
	data: CreatePoem;
	meta: {
		requesterId: number;
		requesterStatus: 'active' | 'suspended' | 'banned';
	};
}

export function createPoemFactory(deps: Dependencies) {
	const { commandsRepository, slugService } = deps;
	return function createPoem(
		params: CreatePoemParams,
	): Promise<{ id: number }> {
		const { data, meta } = params;
		if (meta.requesterStatus !== 'active') {
			throw new PoemCreationDeniedError();
		}
		const slug = slugService.generateSlug(data.title);
		const fullData: InsertPoem = { ...data, slug };
		return commandsRepository.insertPoem(fullData);
	};
}
