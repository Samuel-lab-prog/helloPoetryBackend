import type { AppErrorCode } from '@AppError';

export class DatabaseError extends Error {
	type: AppErrorCode;
	override message: string;

	constructor(type: AppErrorCode, message: string) {
		super(message);
		this.name = 'DatabaseError';
		this.type = type;
		this.message = message;
	}
}

export class DatabaseNotFoundError extends DatabaseError {
	constructor(message?: string) {
		super('NOT_FOUND', message || 'Database entity not found');
		this.name = 'DatabaseNotFoundError';
	}
}

export class DatabaseForbiddenUserOperationError extends DatabaseError {
	constructor(message?: string) {
		super('FORBIDDEN', message || 'Invalid operation on database entity');
		this.name = 'DatabaseForbiddenUserOperationError';
	}
}

export class DatabaseConflictError extends DatabaseError {
	constructor(message?: string) {
		super('CONFLICT', message || 'Database entity conflict error');
		this.name = 'DatabaseConflictError';
	}
}

export class DatabaseUnknownError extends DatabaseError {
	constructor(message?: string) {
		super('UNKNOWN', message || 'Unknown database error occurred');
		this.name = 'DatabaseUnknownError';
	}
}
