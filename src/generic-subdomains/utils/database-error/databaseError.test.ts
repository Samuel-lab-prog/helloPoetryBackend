import { describe, expect, it } from 'bun:test';
import {
	DatabaseConflictError,
	DatabaseForbiddenUserOperationError,
	DatabaseNotFoundError,
	DatabaseUnknownError,
} from './databaseError';

describe('DatabaseError subclasses', () => {
	it('sets default message and type for not found', () => {
		const error = new DatabaseNotFoundError();

		expect(error.name).toBe('DatabaseNotFoundError');
		expect(error.type).toBe('NOT_FOUND');
		expect(error.message).toBe('Database entity not found');
	});

	it('sets default message and type for forbidden', () => {
		const error = new DatabaseForbiddenUserOperationError();

		expect(error.name).toBe('DatabaseForbiddenUserOperationError');
		expect(error.type).toBe('FORBIDDEN');
		expect(error.message).toBe('Invalid operation on database entity');
	});

	it('sets default message and type for conflict', () => {
		const error = new DatabaseConflictError();

		expect(error.name).toBe('DatabaseConflictError');
		expect(error.type).toBe('CONFLICT');
		expect(error.message).toBe('Database entity conflict error');
	});

	it('sets default message and type for unknown', () => {
		const error = new DatabaseUnknownError();

		expect(error.name).toBe('DatabaseUnknownError');
		expect(error.type).toBe('UNKNOWN');
		expect(error.message).toBe('Unknown database error occurred');
	});
});
