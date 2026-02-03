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

export const CreatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,

	excerpt: t.Optional(PoemExcerptSchema),
	tags: t.Optional(PoemTagsCreationSchema),

	visibility: t.Optional(PoemVisibilityEnumSchema),
	status: t.Optional(PoemStatusEnumSchema),

	isCommentable: t.Optional(PoemIsCommentableSchema),

	toUserIds: t.Optional(PoemToUserIdsSchema),
});
