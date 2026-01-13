import { t } from 'elysia';
import type { PublicProfile } from '../../queries/read-models/PublicProfile';
import {
	UserRoleEnumSchema,
	UserStatusEnumSchema,
	UserFriendshipStatusEnumSchema,
} from './Enums';

export const UserPublicProfileSchema = t.Object({
	id: t.Number(),
	nickname: t.String(),
	name: t.String(),
	bio: t.String(),
	avatarUrl: t.String(),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,

	stats: t.Object({
		poemsCount: t.Number(),
		commentsCount: t.Number(),
		friendsCount: t.Number(),
	}),

	friendship: t.Object({
		status: UserFriendshipStatusEnumSchema,
		isRequester: t.Boolean(),
	}),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertUserPublicProfile = _AssertExtends<
	typeof UserPublicProfileSchema.static,
	PublicProfile
>;
