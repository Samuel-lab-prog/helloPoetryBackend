import {
	PoemCommentSchema,
	PoemLikeSchema,
	CommentStatusSchema,
	CommentLikeSchema,
} from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type PoemLike = (typeof PoemLikeSchema)['static'];
export type CommentStatus = (typeof CommentStatusSchema)['static'];
export type CommentLike = (typeof CommentLikeSchema)['static'];
