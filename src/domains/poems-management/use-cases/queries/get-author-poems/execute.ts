import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoem } from '../read-models/AuthorPoem';
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
	): Promise<AuthorPoem[]> {
		const poems = await poemQueriesRepository.selectAuthorPoems({
			authorId: params.authorId,
		});

		return poems.filter((poem) =>
			canViewPoem({
				requesterId: params.requesterId,
				authorId: params.authorId,
				poemStatus: poem.status,
				poemVisibility: poem.visibility,
				isFriend: true,
			}),
		);
	};
}
