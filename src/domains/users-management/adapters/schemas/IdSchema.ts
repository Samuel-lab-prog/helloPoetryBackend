import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/AppError';

export const idSchema = t.Number({
	minimum: 1,
	example: 1,
	readOnly: true,
	...makeValidationError('ID must be a positive integer'),
});
