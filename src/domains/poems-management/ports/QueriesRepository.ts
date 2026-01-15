import type { AuthorPoemListItem } from '../use-cases/queries/read-models/AuthorPoemListItem';

import type { SelectAuthorPoemParams } from './PoemQueryParams';

export interface PoemQueriesRepository {
	selectAuthorPoem(
		params: SelectAuthorPoemParams,
	): Promise<AuthorPoemListItem | null>;
}
