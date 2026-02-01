import type { AppErrorCode } from '@AppError';

export class DomainError extends Error {
	type: AppErrorCode;
	override message: string;

	constructor(type: AppErrorCode, message: string) {
		super(message);
		this.name = 'DomainError';
		this.type = type;
		this.message = message;
	}
}
