import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { SlugService } from '../../../ports/SlugService';
import type { UpdatePoem } from '../models/Index';
import {
	PoemAlreadyExistsError,
	PoemNotFoundError,
	CannotUpdatePublishedPoemError,
	CrossUpdateError,
	PoemUpdateDeniedError,
} from '../Errors';
import type { UserStatus, UserRole } from '@SharedKernel/Enums';
import type { QueriesRepository } from '@Domains/poems-management/ports/QueriesRepository';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	slugService: SlugService;
}

interface UpdatePoemParams {
	data: UpdatePoem;
	poemId: number;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
}

export function updatePoemFactory(deps: Dependencies) {
	const { commandsRepository, queriesRepository, slugService } = deps;

	return async function updatePoem(
		params: UpdatePoemParams,
	): Promise<UpdatePoem> {
		const { data, meta, poemId } = params;

		if (meta.requesterStatus !== 'active') {
			throw new PoemUpdateDeniedError();
		}

		const existingPoem = await queriesRepository.selectPoemById(poemId);

		if (!existingPoem) {
			throw new PoemNotFoundError();
		}

		if (meta.requesterId !== existingPoem.author.id) {
			throw new CrossUpdateError();
		}

		if (existingPoem.status === 'published') {
			throw new CannotUpdatePublishedPoemError();
		}

		const slug = slugService.generateSlug(data.title);
		const fullData = { ...data, slug };

		const result = await commandsRepository.updatePoem(poemId, fullData);

		if (result.ok === true) {
			return result.data;
		}

		if (result.ok === false && result.code === 'CONFLICT') {
			throw new PoemAlreadyExistsError();
		}

		throw result.error;
	};
}
