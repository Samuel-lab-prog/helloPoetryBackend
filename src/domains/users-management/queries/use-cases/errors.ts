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
