import { t } from 'elysia';
import {
	NicknameSchema,
	EmailSchema,
	PasswordSchema,
	NameSchema,
	BioSchema,
	AvatarUrlSchema,
} from '../fields/UserFieldsSchemas';

export const CreateUserSchema = t.Object({
	name: NameSchema,
	nickname: NicknameSchema,
	email: EmailSchema,
	password: PasswordSchema,
	bio: BioSchema,
	avatarUrl: AvatarUrlSchema,
});
