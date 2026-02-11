import type {
	CommandsRepository,
	UnlikePoemParams,
} from '../../../ports/Commands';
import type { PoemsContractForInteractions } from '../../../ports/ExternalServices';
import type { PoemLike } from '../../Models';
import { PoemNotFoundError, LikeNotFoundError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
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
