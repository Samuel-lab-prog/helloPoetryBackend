import { t } from 'elysia';
import { UserRoleEnumSchema } from './fields/Enums';
import { AvatarUrlSchema, NicknameSchema } from './fields/UserFieldsSchemas';
import { idSchema } from '@SharedKernel/Schemas';

export const UserPreviewSchema = t.Object({
	avatarUrl: AvatarUrlSchema,
	id: idSchema,
	nickname: NicknameSchema,
	role: UserRoleEnumSchema,
});
