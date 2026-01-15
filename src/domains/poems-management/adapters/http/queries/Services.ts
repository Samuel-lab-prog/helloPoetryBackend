import { QueriesRepository } from '../../../infra/queries-repository/repository';

import { getAuthorPoemFactory } from '../../../use-cases/queries/get-author-poem/execute';
import { getAuthorPoemsFactory } from '../../../use-cases/queries/get-author-poems/execute';

import type { AuthorPoemListItem } from '../../../use-cases/queries/read-models/AuthorPoemListItem';

export interface PoemQueriesRouterServices {
	getAuthorPoem: (params: {
		poemId: number;
		authorId: number;
		requesterId: number;
	}) => Promise<AuthorPoemListItem>;

	getAuthorPoems: (params: {
		authorId: number;
		requesterId: number;
	}) => Promise<AuthorPoemListItem[]>;
}

export const poemQueriesServices: PoemQueriesRouterServices = {
	getAuthorPoem: getAuthorPoemFactory({
		poemQueriesRepository: QueriesRepository,
	}),

	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: QueriesRepository,
	}),
};
