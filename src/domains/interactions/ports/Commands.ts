import type { PoemLike, PoemComment, CommentReply } from './Models';

export type CommentPoemParams = {
	userId: number;
	poemId: number;
	content: string;
};

export type ReplyCommentParams = {
	userId: number;
	parentCommentId: number;
	content: string;
};

export type DeleteCommentParams = {
	userId: number;
	commentId: number;
};

export type LikePoemParams = {
	userId: number;
	poemId: number;
};

export type UnlikePoemParams = {
	userId: number;
	poemId: number;
};

export interface CommandsRepository {
	createPoemLike(params: { userId: number; poemId: number }): Promise<PoemLike>;
	deletePoemLike(params: { userId: number; poemId: number }): Promise<PoemLike>;
	createPoemComment(params: {
		userId: number;
		poemId: number;
		content: string;
	}): Promise<PoemComment>;
	deletePoemComment(params: { commentId: number }): Promise<void>;
	createCommentReply(params: {
		userId: number;
		parentCommentId: number;
		content: string;
	}): Promise<CommentReply>;
}

export interface CommandsRouterServices {
	likePoem(params: LikePoemParams): Promise<PoemLike>;
	unlikePoem(params: UnlikePoemParams): Promise<void>;
	commentPoem(params: CommentPoemParams): Promise<PoemComment>;
	deleteComment(params: DeleteCommentParams): Promise<void>;
	replyComment(params: ReplyCommentParams): Promise<CommentReply>;
}
