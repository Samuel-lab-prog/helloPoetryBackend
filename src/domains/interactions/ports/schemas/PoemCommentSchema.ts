import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { commentContentSchema, CommentStatusSchema } from './Fields';

export const PoemCommentSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	poemId: idSchema,
	content: commentContentSchema,
	createdAt: DateSchema,
	status: CommentStatusSchema,
	parentId: t.Nullable(idSchema),
});
