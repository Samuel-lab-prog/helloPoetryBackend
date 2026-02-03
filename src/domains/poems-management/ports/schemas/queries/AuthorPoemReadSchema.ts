import { t } from 'elysia';
import {
	idSchema,
	DateSchema,
	NonNegativeIntegerSchema,
	UserPreviewSchema,
} from '@SharedKernel/Schemas';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemTagsReadSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemIsCommentableSchema,
} from '../fields/PoemFieldsSchemas';

import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../fields/Enums';

export const AuthorPoemReadSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	tags: PoemTagsReadSchema,

	isCommentable: PoemIsCommentableSchema,

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	createdAt: DateSchema,

	author: UserPreviewSchema,

	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
