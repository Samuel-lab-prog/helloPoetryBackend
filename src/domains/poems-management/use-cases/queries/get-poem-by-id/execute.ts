import type { QueriesRepository, GetPoemParams } from '../../../ports/Queries';
import { canViewPoem } from '../../Policies';
import type { AuthorPoem } from '../../Models';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export function getPoemFactory({ poemQueriesRepository }: Dependencies) {
	return async function getPoem(params: GetPoemParams): Promise<AuthorPoem> {
		const poem = await poemQueriesRepository.selectPoemById(params.poemId);

		if (!poem) throw new NotFoundError('Poem not found');

		const canAccess = canViewPoem({
			author: {
				id: poem.author.id,
				friendIds: poem.author.friendIds,
				directAccess: true, // valid because this is accessed via direct link
			},
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
		});

		if (!canAccess) throw new ForbiddenError('Access denied to poem');

		return poem;
	};
}
