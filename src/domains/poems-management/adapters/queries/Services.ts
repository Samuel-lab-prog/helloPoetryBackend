import { queriesRepository } from '../../infra/queries-repository/Repository';

import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
	type GetAuthorPoemsParams,
	type GetPoemParams,
	type GetMyPoemsParams,
} from '../../use-cases/queries/Index';

import type { MyPoem, AuthorPoem } from '../../use-cases/Models';

export interface QueriesRouterServices {
	getMyPoems: (params: GetMyPoemsParams) => Promise<MyPoem[]>;
	getAuthorPoems: (params: GetAuthorPoemsParams) => Promise<AuthorPoem[]>;
	getPoemById: (params: GetPoemParams) => Promise<AuthorPoem>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getPoemById: getPoemFactory({
		poemQueriesRepository: queriesRepository,
	}),
};
