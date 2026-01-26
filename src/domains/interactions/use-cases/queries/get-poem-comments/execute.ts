import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemComment } from '../models/Index';
import { PoemNotFoundError } from '../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsContractForInteractions;
}

export interface GetPoemCommentsParams {
	poemId: number;
}

export function getPoemCommentsFactory({
	queriesRepository,
	poemsContract,
}: Dependencies) {
	return async function getPoemComments(
		params: GetPoemCommentsParams,
	): Promise<PoemComment[]> {
		const { poemId } = params;
		const poemResult = await poemsContract.getPoemInteractionInfo(poemId);
		if (!poemResult.exists) {
			throw new PoemNotFoundError();
		}
		return queriesRepository.findCommentsByPoemId({ poemId });
	};
}
