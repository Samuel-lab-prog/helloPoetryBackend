import type { SlugService } from '../../../ports/ExternalServices';
import type {
	UpdatePoemParams,
	CommandsRepository,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UpdatePoemResult } from '../../Models';
import { canUpdatePoem } from '../../Policies';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { ConflictError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
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
			throw new ConflictError(
				'Another poem with the same title already exists',
			);

		throw result.error;
	};
}
