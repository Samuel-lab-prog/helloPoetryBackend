import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemTagsSchema,
} from './fields/PoemFieldsSchemas';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

import {
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
} from './fields/Enums';

export const MyPoemSchema = t.Object({
	id: idSchema,
	slug: PoemSlugSchema,
	title: PoemTitleSchema,
	tags: PoemTagsSchema,

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	isCommentable: t.Boolean(),
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});
