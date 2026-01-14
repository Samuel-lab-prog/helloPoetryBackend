import { DomainError } from '@DomainError';

export class UserCreationError extends DomainError {
	constructor() {
		super('OPERATION_FAILED', 'Error: Failed to create new user');
	}
}

export class UserUpdateError extends DomainError {
	constructor() {
		super('OPERATION_FAILED', 'Error: Failed to update user');
	}
}

export class CrossUserUpdateError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN_USER_OPERATION',
			'Error: Cannot update data of another user',
		);
	}
}
