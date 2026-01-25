import { DomainError } from '@DomainError';

export class PoemNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Poem not found.');
	}
}

export class AlreadyLikedError extends DomainError {
	public constructor() {
		super('CONFLICT', 'User already liked this poem.');
	}
}
