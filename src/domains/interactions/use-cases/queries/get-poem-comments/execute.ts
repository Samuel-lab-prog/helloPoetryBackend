import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/Queries';
import type { PoemsContractForInteractions } from '../../../ports/ExternalServices';
import type { PoemComment } from '../../Models';
import { PoemNotFoundError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsContractForInteractions;
}

export function getPoemCommentsFactory({
	queriesRepository,
	poemsContract,
}: Dependencies) {
	return async function getPoemComments(
		params: GetPoemCommentsParams,
	): Promise<PoemComment[]> {
		const { poemId } = params;

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new PoemNotFoundError();

		return queriesRepository.findCommentsByPoemId({
			poemId,
		});
	};
}
