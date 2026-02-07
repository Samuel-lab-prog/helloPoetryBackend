import type { AuthorPoem, MyPoem } from '../use-cases/Models';

export interface QueriesRepository {
	selectMyPoems(requesterId: number): Promise<MyPoem[]>;
	selectAuthorPoems(authorId: number): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<AuthorPoem | null>;
}
