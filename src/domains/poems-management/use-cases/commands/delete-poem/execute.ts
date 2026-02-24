import type {
	CommandsRepository,
	DeletePoemParams,
} from '../../../ports/Commands';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import {
	ForbiddenError,
	UnknownError,
} from '@GenericSubdomains/utils/domainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function deletePoemFactory(deps: Dependencies) {
	const { commandsRepository, usersContract } = deps;
	return async function deletePoem(params: DeletePoemParams): Promise<void> {
		const { meta } = params;
		const userInfo = await usersContract.selectUserBasicInfo(meta.requesterId);

		if (meta.requesterId !== userInfo.id && meta.requesterRole === 'author')
			throw new ForbiddenError('You are not allowed to delete this poem');

		const result = await commandsRepository.deletePoem(params.poemId);
		if (result.ok === true) return result.data;

		if (result.ok === false) throw new UnknownError('Failed to delete poem');
	};
}
