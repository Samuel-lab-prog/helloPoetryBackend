import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
} from './fields/PoemFieldsSchemas';

import { idSchema } from './parameters/IdSchema';

export const CreatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,
	excerpt: t.Nullable(PoemExcerptSchema),

	tags: t.Optional(t.Array(t.String({ examples: ['nature', 'love', 'life'] }))),
	isCommentable: t.Optional(t.Boolean()),
	toPoemId: t.Optional(idSchema),
	toUserId: t.Optional(idSchema),
});
