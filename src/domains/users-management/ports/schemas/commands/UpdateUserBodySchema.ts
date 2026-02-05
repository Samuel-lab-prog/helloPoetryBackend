import { t } from 'elysia';
import {
	NicknameSchema,
	NameSchema,
	BioSchema,
	AvatarUrlSchema,
} from '../fields/UserFieldsSchemas';

export const UpdateUserBodySchema = t.Partial(
	t.Object({
		name: NameSchema,
		nickname: NicknameSchema,
		bio: BioSchema,
		avatarUrl: AvatarUrlSchema,
	}),
);
