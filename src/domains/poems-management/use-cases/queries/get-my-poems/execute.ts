import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { MyPoem } from '../read-models/MyPoem';

import { PoemAccessDeniedError } from '../errors';
import { canViewPoem } from '../policies/policies';

export interface Dependencies {
	poemQueriesRepository: PoemQueriesRepository;
}

export interface GetMyPoemsParams {
	requesterId: number;
}

export function getMyPoemsFactory({ poemQueriesRepository }: Dependencies) {
	return async function getMyPoems(
		params: GetMyPoemsParams,
	): Promise<MyPoem[]> {
		const canView = canViewPoem({
			requesterId: params.requesterId,
			authorId: params.requesterId,
			poemStatus: 'published',
			poemVisibility: 'public',
		});

		if (!canView) {
			throw new PoemAccessDeniedError();
		}

		const poems = await poemQueriesRepository.selectMyPoems({
			requesterId: params.requesterId,
		});

		return poems;
	};
}
