import { t } from 'elysia';
import { UserRoleEnumSchema } from '../Enums';
import { AvatarUrlSchema, NicknameSchema } from '../UserFieldsSchemas';
import { idSchema } from '@SharedKernel/Schemas';

export const UserPreviewSchema = t.Object({
	avatarUrl: AvatarUrlSchema,
	id: idSchema,
	nickname: NicknameSchema,
	role: UserRoleEnumSchema,
});
