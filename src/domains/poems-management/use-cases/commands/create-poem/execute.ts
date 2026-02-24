import type { SlugService } from '../../../ports/ExternalServices';
import type {
	CommandsRepository,
	CreatePoemParams,
} from '../../../ports/Commands';
import type { CreatePoemDB, CreatePoemResult } from '../../../ports/Models';
import { canCreatePoem } from '../../Policies';
import { type EventBus } from '@SharedKernel/events/EventBus';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { ConflictError } from '@GenericSubdomains/utils/domainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
	usersContract: UsersPublicContract;
	eventBus: EventBus;
}

export function createPoemFactory(deps: Dependencies) {
	const { commandsRepository, slugService, usersContract, eventBus } = deps;
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
					userId: toUserId,
					dedicatorId: meta.requesterId,
					dedicatorNickname: userInfo.nickname,
					poemTitle: data.title,
				});

			for (const mentionedUserId of data?.mentionedUserIds || []) {
				eventBus.publish('USER_MENTION_IN_POEM', {
					poemId: result.data.id,
					poemTitle: data.title,
					userId: mentionedUserId,
					mentionerId: meta.requesterId,
					mentionerNickname: userInfo.nickname,
				});
			}

			return result.data;
		}

		if (result.ok === false && result.code === 'CONFLICT')
			throw new ConflictError(
				'Another poem with the same title already exists',
			);

		throw result.error;
	};
}
