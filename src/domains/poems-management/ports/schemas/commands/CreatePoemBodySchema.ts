import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemTagsCreationSchema,
	PoemIsCommentableSchema,
} from '../fields/PoemFieldsSchemas';

import { idSchema } from '@SharedKernel/Schemas';
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

	dedicationUserIds: t.Optional(
		t.Array(idSchema, { minItems: 1 })
	),
});

