import { t } from 'elysia';
import { idSchema } from './parameters/IdSchema';
import { PoemContentSchema, PoemTitleSchema } from './fields/PoemFieldsSchemas';
import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../schemas/fields/Enums';

import { DateSchema } from '@SharedKernel/Schemas';

export const AuthorPoemSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	content: PoemContentSchema,
	createdAt: DateSchema,
	excerpt: t.Nullable(t.String()),
	tags: t.Array(t.Object({ id: idSchema, name: t.String() })),
	slug: t.String(),
	isCommentable: t.Boolean(),

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
		friendsIds: t.Array(idSchema),
	}),

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});
