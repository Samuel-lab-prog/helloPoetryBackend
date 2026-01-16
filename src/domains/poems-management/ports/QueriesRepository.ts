import type { MyPoem } from '../use-cases/queries/read-models/MyPoem';

import type { SelectMyPoemsParams } from './PoemQueryParams';

export interface PoemQueriesRepository {
	selectMyPoems(params: SelectMyPoemsParams): Promise<MyPoem[]>;
}
