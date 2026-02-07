import { DomainError } from '@DomainError';

export class PoemNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Not found: Poem not found');
	}
}

export class PoemAccessDeniedError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN',
			'Forbidden operation: You do not have access to this poem',
		);
	}
}

export class PoemNotPublicError extends DomainError {
	constructor() {
		super('FORBIDDEN', 'Forbidden operation: Poem is not public');
	}
}

export class PoemAuthorNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Not found: Poem author not found');
	}
}

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

export class PoemUpdateDeniedError extends DomainError {
	constructor(message: string) {
		super('FORBIDDEN', 'Forbidden operation: ' + message);
	}
}

export class InvalidDedicatedUsersError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'One or more dedicated users are invalid or inactive');
	}
}
