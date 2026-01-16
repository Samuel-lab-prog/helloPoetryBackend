import type { PoemQueriesRepository } from '../../../ports/QueriesRepository';
import type { MyPoem } from '../read-models/MyPoem';

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
		const poems = await poemQueriesRepository.selectMyPoems({
			requesterId: params.requesterId,
		});

		return poems.filter((poem) =>
			canViewPoem({
				author: { id: params.requesterId },
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
