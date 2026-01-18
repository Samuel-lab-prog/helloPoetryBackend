import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import { PoemNotFoundError, PoemAccessDeniedError } from '../errors';
import { canViewPoem } from '../policies/policies';
import type { MyPoem } from '../read-models/MyPoem';
import type { AuthorPoem } from '../read-models/AuthorPoem';
import { toAuthorPoem, toMyPoem } from '../dtos';

interface Dependencies {
	poemQueriesRepository: PoemQueriesRepository;
}

export interface GetPoemParams {
	requesterId: number;
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

		if (poem.author.id === params.requesterId) {
			return toMyPoem(poem);
		}

		const canAccess = canViewPoem({
			author: { id: poem.author.id, friendIds: poem.author.friendsIds },
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
			},
			viewer: { id: params.requesterId },
		});

		if (!canAccess) {
			throw new PoemAccessDeniedError();
		}
		return toAuthorPoem(poem);
	};
}
