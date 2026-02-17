import {
	PoemCommentSchema,
	PoemLikeSchema,
	CommentStatusSchema,
} from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type PoemLike = (typeof PoemLikeSchema)['static'];
export type CommentStatus = (typeof CommentStatusSchema)['static'];
