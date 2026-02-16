import { t } from 'elysia';

export const ERROR_CODES = [
	'BAD_REQUEST',
	'UNAUTHORIZED',
	'FORBIDDEN',
	'NOT_FOUND',
	'CONFLICT',
	'GONE',
	'VALIDATION',
	'INTERNAL_SERVER_ERROR',
	'UNKNOWN',
	'UNPROCESSABLE_ENTITY',
] as const;

export type AppErrorCode = (typeof ERROR_CODES)[number];

export interface AppErrorType {
	statusCode: number;
	message: string;
	code: AppErrorCode;
	originalError?: Error;
}

export const appErrorSchema = t.Object({
	message: t.String(),
	statusCode: t.Number({
		minimum: 400,
		maximum: 599,
	}),
	code: t.UnionEnum(ERROR_CODES),
	originalError: t.Optional(t.Any()),
});

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: AppErrorCode;
	public readonly originalError?: Error;

	constructor({ statusCode, message, code, originalError }: AppErrorType) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.code = code;
		this.originalError = originalError;

		Error.captureStackTrace?.(this, AppError);
	}
}

export function createAppError(
	statusCode: number,
	prefix: string,
	message: string,
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return new AppError({
		statusCode,
		message: `${prefix}: ${message}`,
		code,
		originalError,
	});
}

export function BadRequestError(
	message: string = 'Bad request',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(400, 'Bad Request', message, code, originalError);
}

export function UnauthorizedError(
	message: string = 'Unauthorized access',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(401, 'Unauthorized', message, code, originalError);
}

export function ForbiddenError(
	message: string = 'Access is forbidden',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(403, 'Forbidden', message, code, originalError);
}

export function NotFoundError(
	message: string = 'The resource was not found',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(404, 'Not found', message, code, originalError);
}

export function ConflictError(
	message: string = 'The resource already exists',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(409, 'Conflict', message, code, originalError);
}

export function GoneError(
	message: string = 'The resource has been deleted',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(410, 'Resource deleted', message, code, originalError);
}

export function UnprocessableEntityError(
	message: string = 'Unprocessable entity',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(
		422,
		'Unprocessable Entity',
		message,
		code,
		originalError,
	);
}

export function DatabaseError(
	message: string = 'A database error occurred',
	code: AppErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(500, 'Database error', message, code, originalError);
}

export function ServerError(
	message: string = 'An unexpected error occurred',
	code: AppErrorCode = 'INTERNAL_SERVER_ERROR',
	originalError?: Error,
): AppError {
	return createAppError(500, 'Server error', message, code, originalError);
}

export function makeValidationError(message: string) {
	return {
		error() {
			throw UnprocessableEntityError(message, 'VALIDATION');
		},
	};
}

export function makeBadRequestError(message: string) {
	return {
		error() {
			throw BadRequestError(message, 'BAD_REQUEST');
		},
	};
}
