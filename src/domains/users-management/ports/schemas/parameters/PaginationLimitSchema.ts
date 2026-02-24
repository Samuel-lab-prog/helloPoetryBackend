import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/AppError';

export const paginationLimitSchema = t.Optional(
	t.Number({
		minimum: 1,
		maximum: 200,
		...makeValidationError(
			'Limit must be a positive integer between 1 and 200',
		),
	}),
);
