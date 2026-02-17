import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { commentContentSchema } from './Fields';

export const CommentReplySchema = t.Object({
	id: idSchema,
	userId: idSchema,
	poemId: idSchema,
	content: commentContentSchema,
	parentId: idSchema,
	createdAt: DateSchema,
});
