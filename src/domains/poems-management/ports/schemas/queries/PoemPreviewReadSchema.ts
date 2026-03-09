import { t } from 'elysia';
import { DateSchema, idSchema, UserPreviewSchema } from '@SharedKernel/Schemas';
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
	tags: PoemTagsReadSchema,
	author: UserPreviewSchema,
});
