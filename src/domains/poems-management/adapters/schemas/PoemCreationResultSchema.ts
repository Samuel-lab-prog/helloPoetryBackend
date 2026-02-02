import { t } from 'elysia';
import { PoemTitleSchema } from './fields/PoemFieldsSchemas';

import { idSchema } from '@SharedKernel/Schemas';
import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from './fields/Enums';

export const PoemCreationResultSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,
});
