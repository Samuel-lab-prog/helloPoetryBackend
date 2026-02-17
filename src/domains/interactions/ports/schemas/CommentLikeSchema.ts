import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const CommentLikeSchema = t.Object({
	userId: idSchema,
	commentId: idSchema,
	poemId: idSchema,
});
