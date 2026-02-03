import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
} from './fields/PoemFieldsSchemas';

import { PoemStatusEnumSchema, PoemVisibilityEnumSchema } from './fields/Enums';

export const UpdatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	tags: t.Array(t.String({ examples: ['nature', 'love', 'life'] })),
	isCommentable: t.Boolean(),
	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,
});
