const databaseErrors = {
	NOT_FOUND: 'Database entity not found',
	FORBIDDEN_USER_OPERATION: 'Invalid operation on database entity',
	CONFLICT: 'Database entity conflict error',
	UNKNOWN: 'Unknown database error occurred',
};

export class DatabaseError extends Error {
	type: keyof typeof databaseErrors;
	override message: string;

	constructor(type: keyof typeof databaseErrors, message: string) {
		super(databaseErrors[type]);
		this.name = 'DatabaseError';
		this.type = type;
		this.message = message || databaseErrors[type];
	}
}

export class DatabaseNotFoundError extends DatabaseError {
	constructor(message?: string) {
		super('NOT_FOUND', message || databaseErrors.NOT_FOUND);
		this.name = 'DatabaseNotFoundError';
	}
}

export class DatabaseForbiddenUserOperationError extends DatabaseError {
	constructor(message?: string) {
		super(
			'FORBIDDEN_USER_OPERATION',
			message || databaseErrors.FORBIDDEN_USER_OPERATION,
		);
		this.name = 'DatabaseForbiddenUserOperationError';
	}
}

export class DatabaseConflictError extends DatabaseError {
	constructor(message?: string) {
		super('CONFLICT', message || databaseErrors.CONFLICT);
		this.name = 'DatabaseConflictError';
	}
}

export class DatabaseUnknownError extends DatabaseError {
	constructor(message?: string) {
		super('UNKNOWN', message || databaseErrors.UNKNOWN);
		this.name = 'DatabaseUnknownError';
	}
}
