import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemIsCommentableSchema,
} from '../fields/PoemFieldsSchemas';
import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
} from '@SharedKernel/Schemas';

import {
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
} from '../fields/Enums';

export const MyPoemReadSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	tags: PoemTagsReadSchema,

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	isCommentable: PoemIsCommentableSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
