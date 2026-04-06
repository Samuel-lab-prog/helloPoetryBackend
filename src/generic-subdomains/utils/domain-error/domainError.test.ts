import { describe, expect, it } from 'bun:test';
import {
	BadRequestError,
	ConflictError,
	DomainError,
	ForbiddenError,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
	UnknownError,
	UnprocessableEntityError,
} from './domainError';

describe('DomainError', () => {
	it('sets name, type, and message', () => {
		const error = new DomainError('BAD_REQUEST', 'invalid');

		expect(error.name).toBe('DomainError');
		expect(error.type).toBe('BAD_REQUEST');
		expect(error.message).toBe('invalid');
	});

	it('creates specific domain error types', () => {
		expect(new ConflictError('conflict').type).toBe('CONFLICT');
		expect(new BadRequestError('bad').type).toBe('BAD_REQUEST');
		expect(new NotFoundError('missing').type).toBe('NOT_FOUND');
		expect(new ForbiddenError('nope').type).toBe('FORBIDDEN');
		expect(new InternalServerError('oops').type).toBe('INTERNAL_SERVER_ERROR');
		expect(new UnprocessableEntityError('invalid').type).toBe(
			'UNPROCESSABLE_ENTITY',
		);
		expect(new UnauthorizedError('nope').type).toBe('UNAUTHORIZED');
		expect(new UnknownError().type).toBe('UNKNOWN');
	});
});
