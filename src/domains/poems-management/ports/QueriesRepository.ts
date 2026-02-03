import type { AuthorPoem, MyPoem } from '../use-cases/queries/Models';

type PoemByIdParams = { poemId: number };
type AuthorPoemsParams = { authorId: number };
type MyPoemsParams = { requesterId: number };

export interface QueriesRepository {
	selectMyPoems(params: MyPoemsParams): Promise<MyPoem[]>;
	selectAuthorPoems(params: AuthorPoemsParams): Promise<AuthorPoem[]>;
	selectPoemById(params: PoemByIdParams): Promise<AuthorPoem | null>;
}
