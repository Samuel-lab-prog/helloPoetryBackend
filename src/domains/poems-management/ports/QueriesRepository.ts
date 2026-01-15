import type { AuthorPoemListItem } from '../use-cases/queries/read-models/AuthorPoemListItem';

import type {
	SelectAuthorPoemParams,
	SelectAuthorPoemListParams,
} from './PoemQueryParams';

export interface PoemQueriesRepository {
	selectAuthorPoem(
		params: SelectAuthorPoemParams,
	): Promise<AuthorPoemListItem | null>;
	selectAuthorPoemList(
		params: SelectAuthorPoemListParams,
	): Promise<AuthorPoemListItem[]>;
}
