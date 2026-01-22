import { queriesRepository } from '../../../infra/queries-repository/repository';

import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
	type MyPoem,
	type AuthorPoem,
} from '../../../use-cases/queries/index';

export interface QueriesRouterServices {
	getMyPoems: (params: { requesterId: number }) => Promise<MyPoem[]>;
	getAuthorPoems: (params: {
		requesterId: number;
		authorId: number;
	}) => Promise<AuthorPoem[]>;
	getPoemById: (params: {
		requesterId: number;
		poemId: number;
	}) => Promise<AuthorPoem | MyPoem>;
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
