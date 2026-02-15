import type {
	CommandsRepository,
	UnlikePoemParams,
} from '../../../ports/Commands';
import type { PoemsContractForInteractions } from '../../../ports/ExternalServices';
import { NotFoundError } from '@DomainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type { QueriesRepository } from '../../../ports/Queries';

export interface UnlikePoemDependencies {
	queriesRepository: QueriesRepository;
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	usersContract: UsersPublicContract;
}

export function unlikePoemFactory({
	commandsRepository,
	poemsContract,
	queriesRepository,
	usersContract,
}: UnlikePoemDependencies) {
	return async function unlikePoem(params: UnlikePoemParams): Promise<void> {
		const { userId, poemId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);

		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);
		v.poem(poemInfo)
			.withModerationStatus(['approved'])
			.withStatus(['published'])
			.withVisibility(['public', 'friends', 'unlisted']);

		const existingLike = await queriesRepository.findPoemLike({
			userId,
			poemId,
		});
		if (!existingLike) throw new NotFoundError('Like not found');

		await commandsRepository.deletePoemLike({ userId, poemId });
	};
}
