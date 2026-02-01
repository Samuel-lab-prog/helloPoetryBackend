import { t } from 'elysia';
import { idSchema, DateSchema } from '@SharedKernel/Schemas';
import { UserRoleEnumSchema, UserStatusEnumSchema } from './fields/Enums';
import {
	AvatarUrlSchema,
	BioSchema,
	EmailSchema,
	NameSchema,
	NicknameSchema,
} from './fields/UserFieldsSchemas';

export const FullUserSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	email: EmailSchema,
	bio: BioSchema,
	avatarUrl: AvatarUrlSchema,
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	createdAt: DateSchema,
	updatedAt: DateSchema,
	emailVerifiedAt: t.Nullable(DateSchema),
});
