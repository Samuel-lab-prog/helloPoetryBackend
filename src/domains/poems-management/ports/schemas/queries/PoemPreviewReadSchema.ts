import { t } from 'elysia';
import { idSchema, UserPreviewSchema } from '@SharedKernel/Schemas';
import {
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemTitleSchema,
} from '../PoemFieldsSchemas';

export const PoemPreviewReadSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	tags: PoemTagsReadSchema,
	author: UserPreviewSchema,
});
