import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemTagsCreationSchema,
	PoemIsCommentableSchema,
} from '../fields/PoemFieldsSchemas';

import {
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../fields/Enums';

import { idSchema } from '@SharedKernel/Schemas';

export const UpdatePoemBodySchema = t.Object({
	title: t.Optional(PoemTitleSchema),
	content: t.Optional(PoemContentSchema),
	excerpt: t.Optional(PoemExcerptSchema),
	tags: t.Optional(PoemTagsCreationSchema),

	visibility: t.Optional(PoemVisibilityEnumSchema),
	status: t.Optional(PoemStatusEnumSchema),

	isCommentable: t.Optional(PoemIsCommentableSchema),

	dedicationUserIds: t.Optional(
		t.Array(idSchema)
	),
});

