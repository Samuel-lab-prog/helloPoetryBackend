import { t } from 'elysia';
import type {
	userStatus,
	friendshipStatus,
	userRole,
} from '../../../use-cases/queries/read-models/Enums';

export const UserStatusEnumSchema = t.UnionEnum([
	'active',
	'suspended',
	'banned',
] as const);
export const UserRoleEnumSchema = t.UnionEnum([
	'user',
	'author',
	'moderator',
] as const);
export const UserFriendshipStatusEnumSchema = t.UnionEnum([
	'rejected',
	'pending',
	'accepted',
	'blocked',
] as const);

type _AssertExtends<_T extends _U, _U> = true;

type _AssertUserStatus = _AssertExtends<
	typeof UserStatusEnumSchema.static,
	userStatus
>;
type _AssertUserRole = _AssertExtends<
	typeof UserRoleEnumSchema.static,
	userRole
>;
type _AssertFriendshipStatus = _AssertExtends<
	typeof UserFriendshipStatusEnumSchema.static,
	friendshipStatus
>;
