import type { PoemComment } from '../use-cases/Models';

export type GetPoemCommentsParams = {
	poemId: number;
};

export interface QueriesRepository {
	selectCommentById(params: { commentId: number }): Promise<PoemComment | null>;
	findCommentsByPoemId(params: { poemId: number }): Promise<PoemComment[]>;
	existsPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;
}

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemComment[]>;
}
