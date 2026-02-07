import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { MyPoem } from '../../Models';
import { canViewPoem } from '../../Policies';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export type GetMyPoemsParams = {
	requesterId: number;
};

export function getMyPoemsFactory({ poemQueriesRepository }: Dependencies) {
	return async function getMyPoems(
		params: GetMyPoemsParams,
	): Promise<MyPoem[]> {
		const poems = await poemQueriesRepository.selectMyPoems(params.requesterId);
		return poems.filter((poem) =>
			canViewPoem({
				author: { id: params.requesterId },
				poem: {
					id: poem.id,
					status: poem.status,
					visibility: poem.visibility,
					moderationStatus: poem.moderationStatus,
				},
				viewer: { id: params.requesterId },
			}),
		);
	};
}
