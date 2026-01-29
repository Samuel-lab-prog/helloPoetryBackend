import { t } from 'elysia';

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
