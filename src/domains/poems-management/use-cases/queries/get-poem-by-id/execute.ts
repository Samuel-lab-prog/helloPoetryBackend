import type { QueriesRepository } from '../../../ports/QueriesRepository';
import { PoemNotFoundError, PoemAccessDeniedError } from '../errors';
import { canViewPoem } from '../policies/policies';
import type { MyPoem, AuthorPoem } from '../models/Index';
import { toAuthorPoem, toMyPoem } from '../dtos';
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
	return async function getPoem(
		params: GetPoemParams,
	): Promise<AuthorPoem | MyPoem> {
		const poem = await poemQueriesRepository.selectPoemById(params.poemId);

		if (!poem) {
			throw new PoemNotFoundError();
		}

		const isAuthor = poem.author.id === params.requesterId;

		const canAccess = canViewPoem({
			author: {
				id: poem.author.id,
				friendIds: poem.author.friendsIds,
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

		return isAuthor ? toMyPoem(poem) : toAuthorPoem(poem);
	};
}
