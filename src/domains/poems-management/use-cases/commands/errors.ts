import { DomainError } from '@DomainError';

export class PoemCreationDeniedError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN',
			'Forbidden operation: You do not have permission to create a poem',
		);
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

export class CannotUpdatePublishedPoemError extends DomainError {
	constructor() {
		super('FORBIDDEN', 'Cannot update a published poem');
	}
}

export class PoemUpdateDeniedError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN',
			'Forbidden operation: You do not have permission to update this poem',
		);
	}
}
