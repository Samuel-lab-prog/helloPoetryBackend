import {
	PoemCommentSchema,
	PoemLikeSchema,
	CommentReplySchema,
} from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type PoemLike = (typeof PoemLikeSchema)['static'];
export type CommentReply = (typeof CommentReplySchema)['static'];
