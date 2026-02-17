import {
	PoemCommentSchema,
	PoemLikeSchema,
} from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type PoemLike = (typeof PoemLikeSchema)['static'];
