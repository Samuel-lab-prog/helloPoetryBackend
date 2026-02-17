import { t } from 'elysia';

export const commentContentSchema = t.String({
	minLength: 1,
	maxLength: 300,
	examples: ['Awesome poem! Loved every bit of it.'],
});

export const CommentStatusSchema = t.UnionEnum([
	'visible',
	'deletedByAuthor',
	'deletedByModerator',
]);
