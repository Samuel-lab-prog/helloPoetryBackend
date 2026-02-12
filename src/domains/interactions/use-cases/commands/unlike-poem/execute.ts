import type {
	CommandsRepository,
	UnlikePoemParams,
} from '../../../ports/Commands';
import type {
	PoemsContractForInteractions,
	UsersContractForInteractions,
} from '../../../ports/ExternalServices';
import type { PoemLike } from '../../Models';
import { BadRequestError, ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	usersContract: UsersContractForInteractions;
}

export function unlikePoemFactory({
	commandsRepository,
	poemsContract,
	usersContract,
}: Dependencies) {
	return async function unlikePoem(
		params: UnlikePoemParams,
	): Promise<PoemLike> {
		const { userId, poemId } = params;

		if (!Number.isInteger(userId) || userId <= 0) {
			throw new BadRequestError('Invalid user id');
		}

		if (!Number.isInteger(poemId) || poemId <= 0) {
			throw new BadRequestError('Invalid poem id');
		}

		const userInfo = await usersContract.getUserBasicInfo(userId);

		if (!userInfo.exists) throw new NotFoundError('User not found');
		if (userInfo.status !== 'active') {
			throw new ForbiddenError('Inactive users cannot unlike poems');
		}

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new NotFoundError('Poem not found');

		const existingLike = await commandsRepository.findPoemLike({
			userId,
			poemId,
		});

		if (!existingLike) throw new NotFoundError('Like not found');

		return commandsRepository.deletePoemLike({
			userId,
			poemId,
		});
	};
}
