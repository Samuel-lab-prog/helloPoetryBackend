import { t } from 'elysia';
import type { CreateUser } from '../../use-cases/commands/commands-models/Create';
import {
	NicknameSchema,
	EmailSchema,
	PasswordSchema,
	NameSchema,
	BioSchema,
	AvatarUrlSchema,
} from './fields/UserFieldsSchemas';

export const CreateUserSchema = t.Object({
	name: NameSchema,
	nickname: NicknameSchema,
	email: EmailSchema,
	password: PasswordSchema,
	bio: BioSchema,
	avatarUrl: AvatarUrlSchema,
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertCreateUser = _AssertExtends<
	typeof CreateUserSchema.static,
	CreateUser
>;
