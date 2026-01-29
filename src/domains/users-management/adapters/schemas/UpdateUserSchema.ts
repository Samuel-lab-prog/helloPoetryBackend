import { t } from 'elysia';
import {
	NicknameSchema,
	NameSchema,
	BioSchema,
	AvatarUrlSchema,
} from './fields/UserFieldsSchemas';

export const UpdateUserSchema = t.Partial(
	t.Object({
		name: NameSchema,
		nickname: NicknameSchema,
		bio: BioSchema,
		avatarUrl: AvatarUrlSchema,
	}),
);
