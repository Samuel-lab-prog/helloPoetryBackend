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
