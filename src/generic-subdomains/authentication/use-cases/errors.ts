import { DomainError } from '@DomainError';

export class InvalidCredentialsError extends DomainError {
	constructor() {
		super('UNAUTHORIZED', 'Unauthorized: Invalid email or password');
	}
}

export class InvalidTokenError extends DomainError {
	constructor() {
		super('BAD_REQUEST', 'Unauthorized: Invalid or expired token');
	}
}

export class ClientNotFoundError extends DomainError {
	constructor() {
		super('NOT_FOUND', 'Client not found');
	}
}
