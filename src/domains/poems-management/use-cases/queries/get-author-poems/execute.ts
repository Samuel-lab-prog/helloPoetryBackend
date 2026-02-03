import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoem } from '../Models';
import { canViewPoem } from '../policies/policies';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

interface GetAuthorPoemsParams {
	authorId: number;
	requesterId?: number;
	requesterRole?: UserRole;
	requesterStatus?: UserStatus;
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
