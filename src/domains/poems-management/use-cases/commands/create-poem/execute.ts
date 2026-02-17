import type { SlugService } from '../../../ports/ExternalServices';
import type {
	CommandsRepository,
	CreatePoemParams,
} from '../../../ports/Commands';
import { PoemAlreadyExistsError } from '../../Errors';
import type { CreatePoemDB, CreatePoemResult } from '../../Models';
import { canCreatePoem } from '../../Policies';
import { eventBus } from '@SharedKernel/events/EventBus';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
	usersContract: UsersPublicContract;
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
		const userInfo = await usersContract.selectUserBasicInfo(meta.requesterId);

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
		if (result.ok === true) {
			for (const toUserId of data?.toUserIds || [])
				eventBus.publish('POEM_DEDICATED', {
					poemId: result.data.id,
					userId: authorCtx.id,
					dedicatorId: toUserId,
					dedicatorNickname: userInfo.nickname,
					poemTitle: data.title,
				});

			return result.data;
		}

		if (result.ok === false && result.code === 'CONFLICT')
			throw new PoemAlreadyExistsError();

		throw result.error;
	};
}
