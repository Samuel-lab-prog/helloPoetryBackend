import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoemListItem } from '../read-models/AuthorPoemListItem';

import { PoemAccessDeniedError } from '../errors';
import { canViewPoem } from '../policies/policies';

export interface Dependencies {
	poemQueriesRepository: PoemQueriesRepository;
}

export interface GetAuthorPoemsParams {
	requesterId: number;
	authorId: number;
}

export function getAuthorPoemsFactory({ poemQueriesRepository }: Dependencies) {
	return async function getAuthorPoems(
		params: GetAuthorPoemsParams,
	): Promise<AuthorPoemListItem[]> {
		const canView = canViewPoem({
			requesterId: params.requesterId,
			authorId: params.authorId,
			poemStatus: 'published',
			poemVisibility: 'public',
		});

		if (!canView) {
			throw new PoemAccessDeniedError();
		}

		const poems = await poemQueriesRepository.selectAuthorPoemList({
			authorId: params.authorId,
		});

		return poems;
	};
}
