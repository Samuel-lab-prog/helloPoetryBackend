import { t } from 'elysia';
import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
} from '@SharedKernel/Schemas';
import { CommentContentSchema, CommentStatusSchema } from './Fields';

export const PoemCommentSchema = t.Object({
	id: idSchema,
	poemId: idSchema,
	content: CommentContentSchema,
	createdAt: DateSchema,
	status: CommentStatusSchema,
	parentId: t.Nullable(idSchema),
	aggregateChildrenCount: NonNegativeIntegerSchema,
	likesCount: NonNegativeIntegerSchema,
	likedByCurrentUser: t.Boolean(),
	author: t.Object({
		id: idSchema,
		nickname: t.String(),
		avatarUrl: t.String(),
	}),
});
