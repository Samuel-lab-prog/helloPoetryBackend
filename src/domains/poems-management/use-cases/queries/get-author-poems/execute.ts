import type {
	QueriesRepository,
	GetAuthorPoemsParams,
} from '../../../ports/Queries';
import type { AuthorPoem } from '../../../ports/Models';
import { canViewPoem } from '../../Policies';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export function getAuthorPoemsFactory({ poemQueriesRepository }: Dependencies) {
	return async function getAuthorPoems(
		params: GetAuthorPoemsParams,
	): Promise<AuthorPoem[]> {
		const poems = await poemQueriesRepository.selectAuthorPoems(
			params.authorId,
		);

		return poems.filter((poem) =>
			canViewPoem({
				author: { id: poem.author.id, friendIds: poem.author.friendIds },
				poem: {
					id: poem.id,
					status: poem.status,
					visibility: poem.visibility,
					moderationStatus: poem.moderationStatus,
				},
				viewer: {
					id: params.requesterId,
					role: params.requesterRole,
					status: params.requesterStatus,
				},
			}),
		);
	};
}
