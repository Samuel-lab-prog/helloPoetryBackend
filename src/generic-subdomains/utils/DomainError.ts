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

export class ConflictError extends DomainError {
	public constructor(message: string) {
		super('CONFLICT', message);
	}
}

export class BadRequestError extends DomainError {
	public constructor(message: string) {
		super('BAD_REQUEST', message);
	}
}

export class NotFoundError extends DomainError {
	public constructor(message: string) {
		super('NOT_FOUND', message);
	}
}

export class ForbiddenError extends DomainError {
	public constructor(message: string) {
		super('FORBIDDEN', message);
	}
}

export class InternalServerError extends DomainError {
	public constructor(message: string) {
		super('INTERNAL_SERVER_ERROR', message);
	}
}

export class UnprocessableEntityError extends DomainError {
	public constructor(message: string) {
		super('UNPROCESSABLE_ENTITY', message);
	}
}

export class UnauthorizedError extends DomainError {
	public constructor(message: string) {
		super('UNAUTHORIZED', message);
	}
}