import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoemListItem } from '../read-models/AuthorPoemListItem';

import { PoemAccessDeniedError, PoemNotFoundError } from '../errors';

import { canViewPoem } from '../policies/policies';

export interface Dependencies {
	poemQueriesRepository: PoemQueriesRepository;
}

export interface GetAuthorPoemParams {
	requesterId: number;
	authorId: number;
	poemId: number;
}

export function getAuthorPoemFactory({ poemQueriesRepository }: Dependencies) {
	return async function getAuthorPoem(
		params: GetAuthorPoemParams,
	): Promise<AuthorPoemListItem> {
		const canView = canViewPoem({
			requesterId: params.requesterId,
			authorId: params.authorId,
			poemStatus: 'published',
			poemVisibility: 'public',
		});

		if (!canView) {
			throw new PoemAccessDeniedError();
		}

		const poem = await poemQueriesRepository.selectAuthorPoem({
			poemId: params.poemId,
		});

		if (!poem) {
			throw new PoemNotFoundError();
		}
		return poem;
	};
}
