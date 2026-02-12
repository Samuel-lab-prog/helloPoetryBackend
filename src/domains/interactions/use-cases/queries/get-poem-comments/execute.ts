import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/Queries';
import type { PoemsContractForInteractions } from '../../../ports/ExternalServices';
import type { PoemComment } from '../../Models';
import { BadRequestError, ForbiddenError, NotFoundError } from '@DomainError';

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

		if (!Number.isInteger(poemId) || poemId <= 0) {
			throw new BadRequestError('Invalid poem id');
		}

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new NotFoundError('Poem not found');
		if (
			poemInfo.visibility === 'private' ||
			poemInfo.visibility === 'friends'
		) {
			throw new ForbiddenError('Cannot list comments for this poem');
		}

		return queriesRepository.findCommentsByPoemId({
			poemId,
		});
	};
}
