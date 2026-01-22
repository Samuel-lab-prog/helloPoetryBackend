import type { AuthorPoem } from '../use-cases/queries/read-models/AuthorPoem';
import type { MyPoem } from '../use-cases/queries/read-models/MyPoem';
import type { FullPoem } from '../use-cases/queries/read-models/FullPoem';

import type {
	SelectMyPoemsParams,
	SelectAuthorPoemsParams,
} from './PoemQueryParams';

export interface QueriesRepository {
	selectMyPoems(params: SelectMyPoemsParams): Promise<MyPoem[]>;
	selectAuthorPoems(params: SelectAuthorPoemsParams): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<FullPoem | null>;
}
