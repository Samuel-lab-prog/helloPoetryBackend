import { t } from 'elysia';
import { makeValidationError } from '@AppError';

export const PoemTitleSchema = t.String({
	minLength: 3,
	maxLength: 120,
	example: 'Noite sobre o cais',
	pattern: '^(?!\\s*$).+',
	...makeValidationError(
		'Title must be between 3 and 120 characters and contain non-whitespace characters',
	),
});

export const PoemContentSchema = t.String({
	minLength: 1,
	maxLength: 10_000,
	example: `O mar respira lento
sob a lua cansada`,
	pattern: '^(?!\\s*$)[\\s\\S]+$',
	...makeValidationError(
		'Poem content cannot be empty or contain only whitespace',
	),
});

export const PoemExcerptSchema = t.Nullable(
	t.String({
		maxLength: 255,
		example: 'O mar respira lento sob a lua cansada...',
		...makeValidationError('Excerpt must be at most 255 characters long'),
	}),
);

export const PoemSlugSchema = t.String({
	pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
	example: 'noite-sobre-o-cais',
	readOnly: true,
	...makeValidationError(
		'Slug must contain only lowercase letters, numbers, and hyphens',
	),
});

export const PoemTagsSchema = t.Optional(
	t.Array(
		t.String({
			minLength: 2,
			maxLength: 24,
			pattern: '^[a-zA-Z0-9_-]+$',
			example: 'melancolia',
			...makeValidationError(
				'Tags must contain only letters, numbers, hyphens or underscores',
			),
		}),
		{
			maxItems: 5,
			...makeValidationError('You can specify up to 5 tags per poem'),
		},
	),
);
