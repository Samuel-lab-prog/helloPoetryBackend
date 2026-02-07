import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const PoemLikeSchema = t.Object({
	userId: idSchema,
	poemId: idSchema,
});
