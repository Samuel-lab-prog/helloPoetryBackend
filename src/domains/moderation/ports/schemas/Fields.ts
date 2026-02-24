import { makeValidationError } from '@GenericSubdomains/utils/appError';
import { t } from 'elysia';

export const sanctionReasonSchema = t.String({
	minLength: 10,
	maxLength: 500,
	...makeValidationError('Reason must be between 10 and 500 characters long'),
});
