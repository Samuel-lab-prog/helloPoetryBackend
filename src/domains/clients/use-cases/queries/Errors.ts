import { DomainError } from '@DomainError';

export class ClientNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Client not found.');
	}
}

export class ClientValidationError extends DomainError {
	public constructor() {
		super('VALIDATION_FAILED', 'Client data is invalid.');
	}
}
