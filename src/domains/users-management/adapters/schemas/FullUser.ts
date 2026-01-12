import { t } from 'elysia';
import type { FullUser } from '../../queries/read-models/FullUser';
import { UserRoleEnumSchema, UserStatusEnumSchema } from './Enums';

export const FullUserSchema = t.Object({
	id: t.Number(),
	nickname: t.String(),
	name: t.String(),
	email: t.String(),
	bio: t.String(),
	avatarUrl: t.String(),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	createdAt: t.Date(),
	updatedAt: t.Date(),
	emailVerifiedAt: t.Nullable(t.Date()),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertFullUser = _AssertExtends<typeof FullUserSchema.static, FullUser>;
