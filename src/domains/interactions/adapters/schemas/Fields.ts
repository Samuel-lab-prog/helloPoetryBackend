import { t } from 'elysia';

export const commentContentSchema = t.String({
	minLength: 1,
	maxLength: 1000,
	examples: ['Awesome poem! Loved every bit of it.'],
});
