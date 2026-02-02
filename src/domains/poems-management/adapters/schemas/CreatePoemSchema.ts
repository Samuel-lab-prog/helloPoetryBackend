import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
} from './fields/PoemFieldsSchemas';

import { idSchema } from './parameters/IdSchema';
import { PoemStatusEnumSchema, PoemVisibilityEnumSchema } from './fields/Enums';

export const CreatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,
	excerpt: t.Nullable(PoemExcerptSchema),
	visibility: t.Optional(PoemVisibilityEnumSchema),
	status: t.Optional(PoemStatusEnumSchema),

	tags: t.Optional(t.Array(t.String({ examples: ['nature', 'love', 'life'] }))),
	isCommentable: t.Optional(t.Boolean()),
	toPoemId: t.Optional(idSchema),
	addresseeId: t.Optional(idSchema),
});
