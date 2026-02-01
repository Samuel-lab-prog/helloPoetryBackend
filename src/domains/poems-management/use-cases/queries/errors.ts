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
