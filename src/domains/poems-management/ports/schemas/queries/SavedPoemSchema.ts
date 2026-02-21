import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { PoemSlugSchema, PoemTitleSchema } from '../PoemFieldsSchemas';

export const SavedPoemSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	savedAt: DateSchema,
});
