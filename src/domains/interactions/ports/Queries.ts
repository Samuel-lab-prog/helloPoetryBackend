import type { PoemComment } from './Models';

export type GetPoemCommentsParams = {
	poemId: number;
	userId: number;
};

export interface QueriesRepository {
	selectCommentById(params: { commentId: number }): Promise<PoemComment | null>;
	selectCommentsByPoemId(params: { poemId: number }): Promise<PoemComment[]>;
	selectPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;
	selectCommentLike(params: {
		userId: number;
		commentId: number;
	}): Promise<boolean>;
}

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemComment[]>;
}
