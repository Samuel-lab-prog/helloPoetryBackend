import { DomainError } from '@DomainError';

export class PoemNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Poem not found.');
	}
}
