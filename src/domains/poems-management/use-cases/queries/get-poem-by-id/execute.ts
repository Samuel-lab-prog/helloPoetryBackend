import type { QueriesRepository } from '../../../ports/QueriesRepository';
import { PoemNotFoundError, PoemAccessDeniedError } from '../Errors';
import { canViewPoem } from '../policies/policies';
import type { AuthorPoem } from '../Models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

interface GetPoemParams {
	requesterId?: number;
	requesterRole?: UserRole;
	requesterStatus?: UserStatus;
	poemId: number;
}

export function getPoemFactory({ poemQueriesRepository }: Dependencies) {
	return async function getPoem(params: GetPoemParams): Promise<AuthorPoem> {
		const poem = await poemQueriesRepository.selectPoemById(params.poemId);

		if (!poem) {
			throw new PoemNotFoundError();
		}

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
		if (!canAccess) {
			throw new PoemAccessDeniedError();
		}

		return poem;
	};
}
