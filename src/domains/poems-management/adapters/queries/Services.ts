import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { queriesRepository } from '../../infra/queries-repository/Repository';

import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
} from '../../use-cases/queries/Index';

import type { MyPoem, AuthorPoem } from '../../use-cases/queries/Models';

export interface QueriesRouterServices {
	getMyPoems: (params: { requesterId: number }) => Promise<MyPoem[]>;
	getAuthorPoems: (params: {
		requesterRole: UserRole;
		requesterStatus: UserStatus;
		requesterId: number;
		authorId: number;
	}) => Promise<AuthorPoem[]>;
	getPoemById: (params: {
		requesterRole: UserRole;
		requesterStatus: UserStatus;
		requesterId: number;
		poemId: number;
	}) => Promise<AuthorPoem>;
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
