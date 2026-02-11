import type { UsersServicesForPoems } from '../../../ports/UsersServices';
import type { SlugService } from '../../../ports/SlugService';
import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { CreatePoemParams } from '../../../ports/CommandsServices';
import { PoemAlreadyExistsError } from '../../Errors';
import type { CreatePoemDB, CreatePoemResult } from '../../Models';
import { canCreatePoem } from '../../Policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
	usersContract: UsersServicesForPoems;
}

export function createPoemFactory(deps: Dependencies) {
	const { commandsRepository, slugService, usersContract } = deps;

	return async function createPoem(
		params: CreatePoemParams,
	): Promise<CreatePoemResult> {
		const { data, meta } = params;
		const authorCtx = {
			id: meta.requesterId,
			status: meta.requesterStatus,
			role: meta.requesterRole,
		};
		await canCreatePoem({
			ctx: {
				author: authorCtx,
			},
			usersContract,
			toUserIds: data.toUserIds,
		});
		const slug = slugService.generateSlug(data.title);
		const poem: CreatePoemDB = {
			...data,
			slug,
			authorId: meta.requesterId,
		};

		const result = await commandsRepository.insertPoem(poem);
		if (result.ok === true) return result.data;

		if (result.ok === false && result.code === 'CONFLICT') {
			throw new PoemAlreadyExistsError();
		}

		throw result.error;
	};
}
