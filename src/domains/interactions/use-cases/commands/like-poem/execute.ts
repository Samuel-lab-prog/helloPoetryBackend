import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemLike } from '../models/Index';
import { PoemNotFoundError, AlreadyLikedError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
}

export interface LikePoemParams {
	userId: number;
	poemId: number;
}

export function likePoemFactory({
	commandsRepository,
	poemsContract,
}: Dependencies) {
	return async function likePoem(params: LikePoemParams): Promise<PoemLike> {
		const { userId, poemId } = params;

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) {
			throw new PoemNotFoundError();
		}

		const alreadyLiked = await commandsRepository.existsPoemLike({
			userId,
			poemId,
		});

		if (alreadyLiked) {
			throw new AlreadyLikedError();
		}

		const poemLike = await commandsRepository.createPoemLike({
			userId,
			poemId,
		});

		return poemLike;
	};
}
