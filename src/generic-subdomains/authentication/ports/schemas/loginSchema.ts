import { t } from 'elysia';
import { makeValidationError } from '@AppError';

export const emailSchema = t.String({
	format: 'email',
	example: 'ana@gmail.com',
	...makeValidationError('Email must be a valid email address'),
});

export const passwordSchema = t.String({
	minLength: 8,
	maxLength: 30,
	example: 'ana12345',
	...makeValidationError('Password must be between 8 and 30 characters'),
});

export const loginSchema = t.Object({
	email: emailSchema,
	password: passwordSchema,
});
