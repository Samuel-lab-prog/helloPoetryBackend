import { t } from 'elysia';

export interface AppErrorType {
	statusCode: number;
	errorMessages: string[];
}

export const appErrorSchema = t.Object({
	errorMessages: t.Array(t.String()),
	statusCode: t.Number({
		minimum: 400,
		maximum: 599,
	}),
});

export class AppError extends Error {
	public statusCode: number;
	public errorMessages: string[];

	constructor({ statusCode, errorMessages }: AppErrorType) {
		super(errorMessages.join(', '));

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.errorMessages = errorMessages;

		Error.captureStackTrace?.(this, AppError);
	}
}

export function createAppError(
	statusCode: number,
	prefix: string,
	message: string,
): AppError {
	return new AppError({
		statusCode,
		errorMessages: [`${prefix}: ${message}`],
	});
}

export function BadRequestError(message: string = 'Bad request'): AppError {
	return createAppError(400, 'Bad Request', message);
}

export function UnauthorizedError(
	message: string = 'Unauthorized access',
): AppError {
	return createAppError(401, 'Unauthorized', message);
}

export function ForbiddenError(
	message: string = 'Access is forbidden',
): AppError {
	return createAppError(403, 'Forbidden', message);
}

export function NotFoundError(
	message: string = 'The resource was not found',
): AppError {
	return createAppError(404, 'Not found', message);
}

export function ConflictError(
	message: string = 'The resource already exists',
): AppError {
	return createAppError(409, 'Conflict', message);
}

export function GoneError(
	message: string = 'The resource has been deleted',
): AppError {
	return createAppError(410, 'Resource deleted', message);
}

export function UnprocessableEntityError(
	message: string = 'Unprocessable entity',
): AppError {
	return createAppError(422, 'Unprocessable Entity', message);
}

export function DatabaseError(
	message: string = 'A database error occurred',
): AppError {
	return createAppError(500, 'Database error', message);
}

export function ServerError(): AppError {
	return createAppError(500, 'Server error', 'An unexpected error occurred');
}

export function makeValidationError(message: string) {
	return {
		error() {
			throw UnprocessableEntityError(message);
		},
	};
}

export function makeBadRequestError(message: string) {
	return {
		error() {
			throw BadRequestError(message);
		},
	};
}
