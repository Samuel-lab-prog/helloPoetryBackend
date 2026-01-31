import { t } from 'elysia';
import { UserRoleEnumSchema, UserStatusEnumSchema } from './fields/Enums';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	EmailSchema,
	NameSchema,
	NicknameSchema,
} from './fields/UserFieldsSchemas';

export const UserPrivateProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: AvatarUrlSchema,
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	email: EmailSchema,
	emailVerifiedAt: t.Nullable(DateSchema),

	stats: t.Object({
		poemsIds: t.Array(idSchema),
		commentsIds: t.Array(idSchema),
		friendsIds: t.Array(idSchema),
	}),

	friendshipRequestsSent: t.Array(
		t.Object({
			addresseeId: idSchema,
			addresseeNickname: NicknameSchema,
			addresseeAvatarUrl: t.Nullable(AvatarUrlSchema),
		}),
	),

	friendshipRequestsReceived: t.Array(
		t.Object({
			requesterId: idSchema,
			requesterNickname: NicknameSchema,
			requesterAvatarUrl: t.Nullable(AvatarUrlSchema),
		}),
	),
});
