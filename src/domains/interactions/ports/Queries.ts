import type { PoemComment } from './Models';

export type GetPoemCommentsParams = {
	poemId: number;
	userId: number;
};

export interface QueriesRepository {
	selectCommentById(params: { commentId: number }): Promise<PoemComment | null>;
	findCommentsByPoemId(params: { poemId: number }): Promise<PoemComment[]>;
	findPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;
	findCommentLike(params: {
		userId: number;
		commentId: number;
	}): Promise<boolean>;
}

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemComment[]>;
}
