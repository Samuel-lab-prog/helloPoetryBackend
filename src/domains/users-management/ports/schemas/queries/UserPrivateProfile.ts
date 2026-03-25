import { t } from 'elysia';
import { UserRoleEnumSchema, UserStatusEnumSchema } from '../Enums';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	EmailSchema,
	NameSchema,
	NicknameSchema,
} from '../UserFieldsSchemas';

export const UserPrivateProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: t.Nullable(AvatarUrlSchema),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	email: EmailSchema,
	emailVerifiedAt: t.Nullable(DateSchema),
	unreadNotificationsCount: t.Number(),

	stats: t.Object({
		poems: t.Array(
			t.Object({
				id: idSchema,
				title: t.String(),
			}),
		),
		commentsIds: t.Array(idSchema),
		friends: t.Array(
			t.Object({
				id: idSchema,
			}),
		),
	}),
	blockedUsersIds: t.Array(idSchema),
});
