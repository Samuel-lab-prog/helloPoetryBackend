import { t } from 'elysia';
import { idSchema } from './parameters/IdSchema';
import { PoemContentSchema, PoemTitleSchema } from './fields/PoemFieldsSchemas';

export const AuthorPoemSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	content: PoemContentSchema,

	createdAt: t.Date(),

	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
	}),

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});
