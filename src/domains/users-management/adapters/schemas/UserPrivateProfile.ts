import { t } from 'elysia';
import type { PrivateProfile } from '../../use-cases/queries/read-models/PrivateProfile';
import {
	UserRoleEnumSchema,
	UserStatusEnumSchema,
	UserFriendshipStatusEnumSchema,
} from './fields/Enums';

export const UserPrivateProfileSchema = t.Object({
	id: t.Number(),
	nickname: t.String(),
	name: t.String(),
	bio: t.String(),
	avatarUrl: t.String(),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	email: t.String(),
	emailVerifiedAt: t.Nullable(t.Date()),
	friendsIds: t.Array(t.Number()),

	stats: t.Object({
		poemsCount: t.Number(),
		commentsCount: t.Number(),
		friendsCount: t.Number(),
		poemsIds: t.Array(t.Number()),
	}),

	friendshipRequests: t.Array(
		t.Object({
			status: UserFriendshipStatusEnumSchema,
			isRequester: t.Boolean(),
			userId: t.Number(),
		}),
	),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertUserPrivateProfile = _AssertExtends<
	typeof UserPrivateProfileSchema.static,
	PrivateProfile
>;
