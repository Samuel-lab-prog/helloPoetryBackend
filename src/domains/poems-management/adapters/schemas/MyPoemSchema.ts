import { t } from 'elysia';
import type { MyPoem } from '../../use-cases/queries/read-models/MyPoem';
import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemTagsSchema,
} from './fields/PoemFieldsSchemas';

import { idSchema } from './parameters/IdSchema';

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

	createdAt: t.Date(),
	updatedAt: t.Date(),

	isCommentable: t.Boolean(),
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertCreateUser = _AssertExtends<typeof MyPoemSchema.static, MyPoem>;
