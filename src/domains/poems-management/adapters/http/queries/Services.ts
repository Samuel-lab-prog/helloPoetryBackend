import { QueriesRepository } from '@Domains/poems-management/infra/queries-repository/repository';

import { getMyPoemsFactory } from '@Domains/poems-management/use-cases/queries/get-my-poems/execute';
import { getAuthorPoemsFactory } from '@Domains/poems-management/use-cases/queries/get-author-poems/execute';
import { getPoemFactory } from '@Domains/poems-management/use-cases/queries/get-poem-by-id/execute';

import type { MyPoem } from '@Domains/poems-management/use-cases/queries/read-models/MyPoem';
import type { AuthorPoem } from '@Domains/poems-management/use-cases/queries/read-models/AuthorPoem';

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
