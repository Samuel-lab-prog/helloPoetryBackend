import { t } from 'elysia';
import { idSchema } from './parameters/IdSchema';
import { PoemContentSchema, PoemTitleSchema } from './fields/PoemFieldsSchemas';
import { PoemStatusEnumSchema, PoemVisibilityEnumSchema } from '../schemas/fields/Enums';

import { DateSchema } from '@SharedKernel/Schemas';

export const AuthorPoemSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	status: PoemStatusEnumSchema,
	content: PoemContentSchema,
	visibility: PoemVisibilityEnumSchema,

	createdAt: DateSchema,

	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
		friendsIds: t.Array(idSchema),
	}),

	stats: t.Object({
		likesCount: t.Number(),
		commentsCount: t.Number(),
	}),
});
