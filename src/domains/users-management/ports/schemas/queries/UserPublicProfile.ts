import { t } from 'elysia';

import { UserRoleEnumSchema, UserStatusEnumSchema } from '../fields/Enums';
import { idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	NameSchema,
	NicknameSchema,
} from '../fields/UserFieldsSchemas';

export const UserPublicProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: AvatarUrlSchema,
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,

	stats: t.Object({
		poemsCount: t.Number(),
		commentsCount: t.Number(),
		friendsCount: t.Number(),
	}),

	isFriend: t.Boolean(),
	hasBlockedRequester: t.Boolean(),
	isBlockedByRequester: t.Boolean(),
	isFriendRequester: t.Boolean(),
});
