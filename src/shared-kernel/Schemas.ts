import { t } from 'elysia';
import { makeValidationError } from '@AppError';

export const idSchema = t.Number({
	minimum: 1,
	example: 1,
	readOnly: true,
	...makeValidationError('ID must be a positive integer'),
});

export const emailSchema = t.String({
	format: 'email',
	example: 'user@example.com',
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
