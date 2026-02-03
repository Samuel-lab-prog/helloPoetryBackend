import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemTagsCreationSchema,
	PoemIsCommentableSchema,
	PoemToUserIdsSchema,
} from '../fields/PoemFieldsSchemas';

import {
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../fields/Enums';

export const UpdatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	tags: PoemTagsCreationSchema,

	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,

	isCommentable: PoemIsCommentableSchema,

	toUserIds: t.Nullable(PoemToUserIdsSchema),
});
