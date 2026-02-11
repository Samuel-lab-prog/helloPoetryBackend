import {
	type GetAuthorPoemsParams,
	type GetPoemParams,
	type GetMyPoemsParams,
} from '../use-cases/queries/Index';

import type { MyPoem, AuthorPoem } from '../use-cases/Models';

export interface QueriesRouterServices {
	getMyPoems: (params: GetMyPoemsParams) => Promise<MyPoem[]>;
	getAuthorPoems: (params: GetAuthorPoemsParams) => Promise<AuthorPoem[]>;
	getPoemById: (params: GetPoemParams) => Promise<AuthorPoem>;
}
