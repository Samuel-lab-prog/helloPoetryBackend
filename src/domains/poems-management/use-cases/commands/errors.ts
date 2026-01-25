import { DomainError } from '@DomainError';

export class PoemCreationDeniedError extends DomainError {
	constructor() {
		super(
			'FORBIDDEN_USER_OPERATION',
			'Forbidden operation: You do not have permission to create a poem',
		);
	}
}
