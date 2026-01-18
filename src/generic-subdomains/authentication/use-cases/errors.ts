import { DomainError } from '@DomainError';

export class InvalidCredentialsError extends DomainError {
	constructor() {
		super('INVALID_CREDENTIALS', 'Unauthorized: Invalid email or password');
	}
}

export class InvalidTokenError extends DomainError {
	constructor() {
		super('INVALID_TOKEN', 'Unauthorized: Invalid or expired token');
	}
}

export class ClientNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Client not found');
	}
}
