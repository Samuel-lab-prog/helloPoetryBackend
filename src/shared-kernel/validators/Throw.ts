import { ForbiddenError } from '@DomainError';
import { ERROR_CODES } from '@AppError';

type ERROR_CODE = (typeof ERROR_CODES)[number];

const errorMap: Record<
	ERROR_CODE,
	new (message: string, originalError?: Error) => Error
> = {
	BAD_REQUEST: Error,
	UNAUTHORIZED: Error,
	FORBIDDEN: ForbiddenError,
	NOT_FOUND: Error,
	CONFLICT: Error,
	GONE: Error,
	VALIDATION: Error,
	INTERNAL_SERVER_ERROR: Error,
	UNKNOWN: Error,
	UNPROCESSABLE_ENTITY: Error,
};

export function throwNew(code: ERROR_CODE, message: string) {
	const ErrorClass = errorMap[code];
	throw new ErrorClass(message);
}
