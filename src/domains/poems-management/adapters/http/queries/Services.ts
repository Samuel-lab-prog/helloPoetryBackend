import { QueriesRepository } from '../../../infra/queries-repository/repository';

import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
	type MyPoem,
	type AuthorPoem,
} from '../../../use-cases/queries/index';

export interface PoemQueriesRouterServices {
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

export const poemQueriesServices: PoemQueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
	getPoemById: getPoemFactory({
		poemQueriesRepository: QueriesRepository,
	}),
};
