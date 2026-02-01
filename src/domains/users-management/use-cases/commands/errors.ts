import { DomainError } from '@DomainError';

export class UserCreationError extends DomainError {
	constructor(message: string) {
		super('INTERNAL_SERVER_ERROR', message);
	}
}

export class UserNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Error: User not found');
	}
}

export class UserCreationConflictError extends DomainError {
	constructor(message: string) {
		super('CONFLICT', message);
	}
}

export class UserUpdateError extends DomainError {
	constructor(message: string) {
		super('INTERNAL_SERVER_ERROR', message);
	}
}

export class UserUpdateConflictError extends DomainError {
	constructor(message: string) {
		super('CONFLICT', message);
	}
}

export class CrossUserUpdateError extends DomainError {
	constructor() {
		super('FORBIDDEN', 'Error: Cannot update data of another user');
	}
}
