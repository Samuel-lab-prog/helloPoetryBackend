import type { AuthorPoem } from '../use-cases/queries/read-models/AuthorPoem';
import type { MyPoem } from '../use-cases/queries/read-models/MyPoem';

import type {
	SelectMyPoemsParams,
	SelectAuthorPoemsParams,
} from './PoemQueryParams';

export interface PoemQueriesRepository {
	selectMyPoems(params: SelectMyPoemsParams): Promise<MyPoem[]>;
	selectAuthorPoems(params: SelectAuthorPoemsParams): Promise<AuthorPoem[]>;
}
