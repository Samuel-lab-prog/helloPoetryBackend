import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const PoemCommentSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	poemId: idSchema,
	content: t.String(),
	createdAt: DateSchema,
});
