import { t } from 'elysia';
import { makeValidationError } from '@root/generic-subdomains/utils/AppError';

export const NicknameSchema = t.String({
	minLength: 3,
	example: 'poetrylover',
	pattern: '^[a-zA-Z0-9_]+$',
	readOnly: true,
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

export const EmailSchema = t.String({
	format: 'email',
	example: 'ana.clara@email.com',
	readOnly: true,
	...makeValidationError('Invalid email address'),
});

export const PasswordSchema = t.String({
	minLength: 8,
	maxLength: 40,
	example: 'strongPassword123',
	...makeValidationError(
		'Password must be at least 8 characters long and at most 40 characters long',
	),
});

export const BioSchema = t.String({
	maxLength: 255,
	example: 'Average poetry lover.',
	...makeValidationError('Bio must be at most 255 characters long'),
});

export const AvatarUrlSchema = t.String({
	format: 'uri',
	example: 'https://cdn.example.com/avatar.png',
	...makeValidationError('Avatar URL must be a valid URL'),
});
