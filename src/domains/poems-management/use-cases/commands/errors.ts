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
