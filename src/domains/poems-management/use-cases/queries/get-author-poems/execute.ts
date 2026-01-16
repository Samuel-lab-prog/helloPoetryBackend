import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoem } from '../read-models/AuthorPoem';

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
		// Need to add policy checks here in the future

		const poems = await poemQueriesRepository.selectAuthorPoems({
			authorId: params.authorId,
		});

		return poems;
	};
}
