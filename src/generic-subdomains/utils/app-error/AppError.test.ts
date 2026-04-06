import { describe, expect, it } from 'bun:test';
import {
	AppError,
	BadRequestError,
	MissingEnvVarError,
	ServerError,
	makeBadRequestError,
	makeValidationError,
} from './AppError';

describe('AppError helpers', () => {
	it('creates prefixed bad request errors', () => {
		const error = BadRequestError('invalid data', 'BAD_REQUEST');

		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe('BAD_REQUEST');
		expect(error.message).toBe('Bad Request: invalid data');
	});

	it('creates missing env var error with proper message', () => {
		const error = MissingEnvVarError('DATABASE_URL');

		expect(error.statusCode).toBe(500);
		expect(error.code).toBe('INTERNAL_SERVER_ERROR');
		expect(error.message).toContain(
			'Missing environment variable: DATABASE_URL',
		);
	});

	it('creates server error with default code', () => {
		const error = ServerError('boom');

		expect(error.statusCode).toBe(500);
		expect(error.code).toBe('INTERNAL_SERVER_ERROR');
		expect(error.message).toBe('Server error: boom');
	});

	it('makeValidationError throws unprocessable entity error', () => {
		const fn = makeValidationError('invalid payload');

		expect(() => fn.error()).toThrow(AppError);
		try {
			fn.error();
		} catch (error) {
			expect((error as AppError).code).toBe('VALIDATION');
		}
	});

	it('makeBadRequestError throws bad request error', () => {
		const fn = makeBadRequestError('missing fields');

		expect(() => fn.error()).toThrow(AppError);
		try {
			fn.error();
		} catch (error) {
			expect((error as AppError).code).toBe('BAD_REQUEST');
		}
	});
});
