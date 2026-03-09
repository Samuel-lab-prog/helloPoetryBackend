import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	NicknameSchema,
} from '@Domains/users-management/ports/schemas/UserFieldsSchemas';

export const FriendRequestsByUserSchema = t.Object({
	sent: t.Array(
		t.Object({
			addresseeId: idSchema,
			addresseeNickname: NicknameSchema,
			addresseeAvatarUrl: t.Nullable(AvatarUrlSchema),
		}),
	),
	received: t.Array(
		t.Object({
			requesterId: idSchema,
			requesterNickname: NicknameSchema,
			requesterAvatarUrl: t.Nullable(AvatarUrlSchema),
		}),
	),
});
