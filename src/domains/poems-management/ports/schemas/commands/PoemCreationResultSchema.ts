import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemToUserIdsSchema,
	PoemExcerptSchema,
	PoemIsCommentableSchema,
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemTitleSchema,
} from '../fields/PoemFieldsSchemas';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../fields/Enums';

export const PoemCreationResultSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	excerpt: t.Nullable(PoemExcerptSchema),
	tags: PoemTagsReadSchema,
	content: PoemContentSchema,

	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	isCommentable: PoemIsCommentableSchema,

	toUserIds: PoemToUserIdsSchema,
});
