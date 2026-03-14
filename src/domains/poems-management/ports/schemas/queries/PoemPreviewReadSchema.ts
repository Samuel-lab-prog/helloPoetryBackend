import { t } from 'elysia';
import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
	UserPreviewSchema,
} from '@SharedKernel/Schemas';
import {
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemTitleSchema,
} from '../PoemFieldsSchemas';

export const PoemPreviewReadSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	createdAt: DateSchema,
	likesCount: t.Optional(NonNegativeIntegerSchema),
	commentsCount: t.Optional(NonNegativeIntegerSchema),
	tags: PoemTagsReadSchema,
	author: UserPreviewSchema,
});
