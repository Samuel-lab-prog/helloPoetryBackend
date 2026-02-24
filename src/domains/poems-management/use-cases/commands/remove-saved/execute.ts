import type { CommandsRepository, UserMetaData } from '../../../ports/Commands';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { UnknownError } from '@GenericSubdomains/utils/domainError';
import { validator } from 'GlobalValidator';
import type { QueriesRepository } from '@Domains/poems-management/ports/Queries';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function removeSavedPoemFactory(deps: Dependencies) {
	const { commandsRepository, usersContract } = deps;

	return async function removeSavedPoem(params: {
		poemId: number;
		meta: UserMetaData;
	}): Promise<void> {
		const { poemId, meta } = params;
		const userId = meta.requesterId;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const result = await commandsRepository.removeSavedPoem({ poemId, userId });
		if (result.ok === true) return;

		throw new UnknownError('Failed to remove saved poem');
	};
}
