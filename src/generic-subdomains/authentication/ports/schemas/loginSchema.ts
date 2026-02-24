import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/appError';

export const EmailSchema = t.String({
	format: 'email',
	example: 'ana@gmail.com',
	...makeValidationError('Email must be a valid email address'),
});

export const PasswordSchema = t.String({
	minLength: 8,
	maxLength: 30,
	example: 'ana12345',
	...makeValidationError('Password must be between 8 and 30 characters'),
});

export const LoginSchema = t.Object({
	email: EmailSchema,
	password: PasswordSchema,
});
