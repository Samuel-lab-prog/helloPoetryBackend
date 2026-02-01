import { t } from 'elysia';

/* ---------------------------------- */
/* Single Source Of Truth */
/* ---------------------------------- */

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
] as const;

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

export type AppErrorCode = (typeof ERROR_CODES)[number];

export interface AppErrorType {
	statusCode: number;
	message: string;
	code: AppErrorCode;
}

/* ---------------------------------- */
/* Schema */
/* ---------------------------------- */

export const appErrorSchema = t.Object({
	message: t.String(),
	statusCode: t.Number({
		minimum: 400,
		maximum: 599,
	}),
	code: t.UnionEnum(ERROR_CODES),
});

/* ---------------------------------- */
/* Error Class */
/* ---------------------------------- */

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: AppErrorCode;

	constructor({ statusCode, message, code }: AppErrorType) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.code = code;

		Error.captureStackTrace?.(this, AppError);
	}
}

export function createAppError(
	statusCode: number,
	prefix: string,
	message: string,
	code: AppErrorCode,
): AppError {
	return new AppError({
		statusCode,
		message: `${prefix}: ${message}`,
		code,
	});
}

export function BadRequestError(
	message: string = 'Bad request',
	code: AppErrorCode,
): AppError {
	return createAppError(400, 'Bad Request', message, code);
}

export function UnauthorizedError(
	message: string = 'Unauthorized access',
	code: AppErrorCode,
): AppError {
	return createAppError(401, 'Unauthorized', message, code);
}

export function ForbiddenError(
	message: string = 'Access is forbidden',
	code: AppErrorCode,
): AppError {
	return createAppError(403, 'Forbidden', message, code);
}

export function NotFoundError(
	message: string = 'The resource was not found',
	code: AppErrorCode,
): AppError {
	return createAppError(404, 'Not found', message, code);
}

export function ConflictError(
	message: string = 'The resource already exists',
	code: AppErrorCode,
): AppError {
	return createAppError(409, 'Conflict', message, code);
}

export function GoneError(
	message: string = 'The resource has been deleted',
	code: AppErrorCode,
): AppError {
	return createAppError(410, 'Resource deleted', message, code);
}

export function UnprocessableEntityError(
	message: string = 'Unprocessable entity',
	code: AppErrorCode,
): AppError {
	return createAppError(422, 'Unprocessable Entity', message, code);
}

export function DatabaseError(
	message: string = 'A database error occurred',
	code: AppErrorCode,
): AppError {
	return createAppError(500, 'Database error', message, code);
}

export function ServerError(): AppError {
	return createAppError(
		500,
		'Server error',
		'An unexpected error occurred',
		'INTERNAL_SERVER_ERROR',
	);
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
