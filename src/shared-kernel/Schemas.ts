import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/appError';

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

export const UserPreviewSchema = t.Object({
	id: idSchema,
	name: t.String(),
	nickname: t.String(),
	avatarUrl: t.Nullable(t.String()),
	friendIds: t.Array(idSchema),
});

export const UserStatusSchema = t.UnionEnum(['active', 'suspended', 'banned']);
export const UserRoleSchema = t.UnionEnum(['moderator', 'admin', 'author']);
