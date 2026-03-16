import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';
import { PoemModerationStatusEnumSchema } from '../Enums';

export const ModeratePoemResultSchema = t.Object({
	id: idSchema,
	moderationStatus: PoemModerationStatusEnumSchema,
});
