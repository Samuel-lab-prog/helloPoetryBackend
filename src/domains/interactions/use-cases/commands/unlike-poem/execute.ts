import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemLike } from '../../Models';
import { PoemNotFoundError, LikeNotFoundError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
}

export type UnlikePoemParams = {
	userId: number;
	poemId: number;
};

export function unlikePoemFactory({
	commandsRepository,
	poemsContract,
}: Dependencies) {
	return async function unlikePoem(
		params: UnlikePoemParams,
	): Promise<PoemLike> {
		const { userId, poemId } = params;

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new PoemNotFoundError();

		const existingLike = await commandsRepository.findPoemLike({
			userId,
			poemId,
		});

		if (!existingLike) throw new LikeNotFoundError();

		return commandsRepository.deletePoemLike({
			userId,
			poemId,
		});
	};
}
