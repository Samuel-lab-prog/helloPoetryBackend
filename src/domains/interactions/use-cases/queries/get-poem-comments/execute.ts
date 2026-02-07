import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemComment } from '../../Models';
import { PoemNotFoundError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsContractForInteractions;
}

export type GetPoemCommentsParams = {
	poemId: number;
};

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
