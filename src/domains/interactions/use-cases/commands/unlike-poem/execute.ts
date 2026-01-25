import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { PoemsContract } from '../../../ports/PoemServices';
import type { PoemLike } from '../models/Index';
import { PoemNotFoundError, LikeNotFoundError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContract;
}

export interface UnlikePoemParams {
	userId: number;
	poemId: number;
}

export function unlikePoemFactory({
	commandsRepository,
	poemsContract,
}: Dependencies) {
	return async function unlikePoem(
		params: UnlikePoemParams,
	): Promise<PoemLike> {
		const { userId, poemId } = params;

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) {
			throw new PoemNotFoundError();
		}

		const existingLike = await commandsRepository.findPoemLike({
			userId,
			poemId,
		});

		if (!existingLike) {
			throw new LikeNotFoundError();
		}

		const removedLike = await commandsRepository.deletePoemLike({
			userId,
			poemId,
		});

		return removedLike;
	};
}
