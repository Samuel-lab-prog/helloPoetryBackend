import type { PoemComment, PoemLike } from '../use-cases/Models';

export type GetPoemCommentsParams = {
	poemId: number;
	userId: number;
};

export interface QueriesRepository {
	selectCommentById(params: { commentId: number }): Promise<PoemComment | null>;
	findCommentsByPoemId(params: { poemId: number }): Promise<PoemComment[]>;
	findPoemLike(params: {
		userId: number;
		poemId: number;
	}): Promise<PoemLike | null>;
}

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemComment[]>;
}
