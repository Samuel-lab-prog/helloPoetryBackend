import { t } from 'elysia';
import { idSchema } from './parameters/IdSchema';
import { PoemContentSchema, PoemTitleSchema } from './fields/PoemFieldsSchemas';

export const AuthorPoemSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	content: PoemContentSchema,
	status: t.String(),
	visibility: t.String(),

	createdAt: t.Date(),

	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
		friendsIds: t.Array(t.Number()),
	}),

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});
