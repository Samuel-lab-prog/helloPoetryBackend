import type {
	UsersServicesForPoems,
	SlugService,
} from '../../../ports/ExternalServices';
import type {
	UpdatePoemParams,
	CommandsRepository,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UpdatePoemResult } from '../../Models';
import { PoemAlreadyExistsError } from '../../Errors';
import { canUpdatePoem } from '../../Policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForPoems;
	slugService: SlugService;
}

export function updatePoemFactory(deps: Dependencies) {
	const { commandsRepository, queriesRepository, slugService, usersContract } =
		deps;

	return async function updatePoem(
		params: UpdatePoemParams,
	): Promise<UpdatePoemResult> {
		const { data, meta, poemId } = params;

		const authorCtx = {
			id: meta.requesterId,
			status: meta.requesterStatus,
			role: meta.requesterRole,
		};
		await canUpdatePoem({
			ctx: {
				author: authorCtx,
			},
			usersContract,
			toUserIds: data.toUserIds ?? [],
			poemId,
			queriesRepository,
		});

		const slug = slugService.generateSlug(data.title);
		const poem = { ...data, slug };

		const result = await commandsRepository.updatePoem(poemId, poem);

		if (result.ok === true) return result.data;

		if (result.ok === false && result.code === 'CONFLICT')
			throw new PoemAlreadyExistsError();

		throw result.error;
	};
}
