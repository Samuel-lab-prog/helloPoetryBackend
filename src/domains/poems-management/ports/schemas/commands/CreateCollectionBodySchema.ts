import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const CreateCollectionSchema = t.Object({
	userId: idSchema,
	name: t.String(),
	description: t.String(),
});
