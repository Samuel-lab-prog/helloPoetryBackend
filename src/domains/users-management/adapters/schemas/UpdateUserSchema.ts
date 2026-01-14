import { t } from 'elysia';
import type { UpdateUserData } from '../../use-cases/commands/commands-models/Update';
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

type _AssertExtends<_T extends _U, _U> = true;
type _AssertUpdateUser = _AssertExtends<
	typeof UpdateUserSchema.static,
	UpdateUserData
>;
