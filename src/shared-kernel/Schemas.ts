import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/AppError';

export const idSchema = t.Number({
	minimum: 1,
	example: 1,
	readOnly: true,
	...makeValidationError('ID must be a positive integer'),
});

export const orderDirectionSchema = t.UnionEnum(['asc', 'desc']);

export const paginationLimitSchema = t.Number({
	minimum: 1,
	maximum: 200,
	...makeValidationError('Limit must be a positive integer between 1 and 200'),
});

export const DateSchema = t.Date({
	example: new Date().toISOString(),
	readOnly: true,
});

export const NullableDateSchema = t.Nullable(DateSchema);

export const NonNegativeIntegerSchema = t.Number({
	minimum: 0,
	...makeValidationError('Value must be a non-negative integer'),
});

export const NicknameSchema = t.String({
	minLength: 3,
	example: 'poetrylover',
	pattern: '^[a-zA-Z0-9_]+$',
	...makeValidationError(
		'Nickname must be at least 3 characters long and contain only letters, numbers, and underscores',
	),
});

export const NameSchema = t.String({
	minLength: 3,
	example: 'Ana Clara',
	pattern: '^(?!\\s*$).+',
	...makeValidationError(
		'Name must be at least 3 characters long and contain non-whitespace characters',
	),
});

export const AvatarUrlSchema = t.String({
	format: 'uri',
	example: 'https://cdn.example.com/avatar.png',
	...makeValidationError('Avatar URL must be a valid URL'),
});

export const UserPreviewSchema = t.Object({
	id: idSchema,
	name: t.String(),
	nickname: t.String(),
	avatarUrl: t.Nullable(t.String()),
	friendIds: t.Array(idSchema),
});

export const UserStatusSchema = t.UnionEnum(['active', 'suspended', 'banned']);
export const UserRoleSchema = t.UnionEnum(['moderator', 'admin', 'author']);
