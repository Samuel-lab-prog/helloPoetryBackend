import type { AuthorPoem, MyPoem } from '../use-cases/queries/Models';

export interface QueriesRepository {
	selectMyPoems(params: { requesterId: number }): Promise<MyPoem[]>;
	selectAuthorPoems(params: { authorId: number }): Promise<AuthorPoem[]>;
	selectPoemById(params: { poemId: number }): Promise<AuthorPoem | null>;
}
