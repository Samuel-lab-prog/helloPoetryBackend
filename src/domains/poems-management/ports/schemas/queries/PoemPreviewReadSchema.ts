import { t } from 'elysia';

import {
  idSchema,
} from '@SharedKernel/Schemas';

import { PoemSlugSchema, PoemTitleSchema } from '../Index';

export const PoemPreviewReadSchema = t.Object({
  id: idSchema,
  title: PoemTitleSchema,
  slug: PoemSlugSchema,
  authorId: idSchema,
});
