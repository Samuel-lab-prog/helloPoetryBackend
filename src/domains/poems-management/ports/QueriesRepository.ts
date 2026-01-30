import type { AuthorPoem } from '../use-cases/queries/models/AuthorPoem';
import type { MyPoem } from '../use-cases/queries/models/MyPoem';
import type { FullPoem } from '../use-cases/queries/models/FullPoem';

export interface QueriesRepository {
	selectMyPoems(params: { requesterId: number }): Promise<MyPoem[]>;
	selectAuthorPoems(params: { authorId: number }): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<FullPoem | null>;
}
