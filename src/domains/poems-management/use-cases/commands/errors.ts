import { DomainError } from '@DomainError';

export class PoemCreationDeniedError extends DomainError {
	constructor(message: string) {
		super('FORBIDDEN', 'Forbidden operation: ' + message);
	}
}

export class PoemAlreadyExistsError extends DomainError {
	constructor() {
		super('CONFLICT', 'You already have a poem with the same title');
	}
}

export class PoemNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'The requested poem was not found');
	}
}

export class PoemUpdateDeniedError extends DomainError {
	constructor(message: string) {
		super('FORBIDDEN', 'Forbidden operation: ' + message);
	}
}

export class InvalidDedicatedUsersError extends DomainError {
	constructor() {
		super('BAD_REQUEST', 'One or more dedicated users are invalid or inactive');
	}
}
