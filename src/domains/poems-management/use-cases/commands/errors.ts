import { DomainError } from '@GenericSubdomains/utils/DomainError';

export class PoemAccessDeniedError extends DomainError {
	constructor() {
		super(
			'CONFLICT',
			'Forbidden operation: You do not have access to this poem',
		);
	}
}
