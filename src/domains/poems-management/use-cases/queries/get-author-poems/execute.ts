import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoem } from '../models/AuthorPoem';
import { canViewPoem } from '../policies/policies';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

interface GetAuthorPoemsParams {
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
				author: { id: poem.author.id, friendIds: poem.author.friendsIds },
				poem: {
					id: poem.id,
					status: poem.status,
					visibility: poem.visibility,
				},
				viewer: { id: params.requesterId },
			}),
		);
	};
}
