import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const CommentContentSchema = t.String({
	minLength: 1,
	maxLength: 300,
	examples: ['Awesome poem! Loved every bit of it.'],
	...makeValidationError(
		'Comment content must be between 1 and 300 characters long.',
	),
});

export const CommentStatusSchema = t.UnionEnum([
	'visible',
	'deletedByAuthor',
	'deletedByModerator',
]);
