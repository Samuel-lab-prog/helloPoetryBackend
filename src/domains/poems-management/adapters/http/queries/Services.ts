import { QueriesRepository } from '../../../infra/queries-repository/repository';

import { getMyPoemsFactory } from '../../../use-cases/queries/get-my-poems/execute';
import { getAuthorPoemsFactory } from '@root/domains/poems-management/use-cases/queries/get-author-poems/execute';

import type { MyPoem } from '../../../use-cases/queries/read-models/MyPoem';
import type { AuthorPoem } from '@root/domains/poems-management/use-cases/queries/read-models/AuthorPoem';

export interface PoemQueriesRouterServices {
	getMyPoems: (params: { requesterId: number }) => Promise<MyPoem[]>;
	getAuthorPoems: (params: {
		requesterId: number;
		authorId: number;
	}) => Promise<AuthorPoem[]>;
}

export const poemQueriesServices: PoemQueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
};
