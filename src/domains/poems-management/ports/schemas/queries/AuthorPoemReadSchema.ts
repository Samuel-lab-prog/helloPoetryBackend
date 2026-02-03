import { t } from 'elysia';
import {
	idSchema,
	DateSchema,
	NonNegativeIntegerSchema,
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

	// We are not going to use schemas from users bounded context here to avoid unnecessary dependencies.
	// In the future, we might consider creating a shared kernel for user basic info if needed.
	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
		friendsIds: t.Array(idSchema),
	}),

	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
