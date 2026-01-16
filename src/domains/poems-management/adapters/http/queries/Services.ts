import { QueriesRepository } from '../../../infra/queries-repository/repository';

import { getMyPoemsFactory } from '../../../use-cases/queries/get-author-poems/execute';

import type { MyPoem } from '../../../use-cases/queries/read-models/MyPoem';

export interface PoemQueriesRouterServices {
	getMyPoems: (params: { requesterId: number }) => Promise<MyPoem[]>;
}

export const poemQueriesServices: PoemQueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
};
