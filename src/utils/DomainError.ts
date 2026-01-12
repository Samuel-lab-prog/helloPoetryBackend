const domainErrors = {
	NOT_FOUND: 'Domain entity not found',
	INVALID_OPERATION: 'Invalid operation on domain entity',
	VALIDATION_FAILED: 'Domain entity validation failed',
	INVALID_CREDENTIALS: 'Invalid email or password',
};

export class DomainError extends Error {
	type: keyof typeof domainErrors;
	override message: string;

	constructor(type: keyof typeof domainErrors, message: string) {
		super(domainErrors[type]);
		this.name = 'DomainError';
		this.type = type;
		this.message = message || domainErrors[type];
	}
}
