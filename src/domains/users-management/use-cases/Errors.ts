import { DomainError } from '@DomainError';

export class ProfileNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Not found: User profile not found');
	}
}

export class UserNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Not found: User not found');
	}
}

export class CrossUserDataAccessError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN',
			'Forbidden operation: Cannot access private user data of another user',
		);
	}
}

export class UserCreationError extends DomainError {
	constructor(message: string) {
		super('INTERNAL_SERVER_ERROR', message);
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

export class UserNotActiveError extends DomainError {
	constructor() {
		super('FORBIDDEN', 'Error: User is not active');
	}
}
