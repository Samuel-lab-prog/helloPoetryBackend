import { PoemCommentSchema, CommentStatusSchema } from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type CommentStatus = (typeof CommentStatusSchema)['static'];
export type CommentLike = {
	userId: number;
	commentId: number;
	poemId: number;
};
