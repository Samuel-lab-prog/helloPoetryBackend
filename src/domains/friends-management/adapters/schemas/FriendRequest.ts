import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const FriendRequestSchema = t.Object({
	requesterId: idSchema,
	addresseeId: idSchema,
});
