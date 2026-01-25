import type { AuthorPoem } from '../use-cases/queries/read-models/AuthorPoem';
import type { MyPoem } from '../use-cases/queries/read-models/MyPoem';
import type { FullPoem } from '../use-cases/queries/read-models/FullPoem';

export interface QueriesRepository {
	selectMyPoems(params: { requesterId: number }): Promise<MyPoem[]>;
	selectAuthorPoems(params: { authorId: number }): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<FullPoem | null>;
}
