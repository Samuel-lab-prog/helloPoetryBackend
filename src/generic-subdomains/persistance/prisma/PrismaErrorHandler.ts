import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseConflictError,
	DatabaseNotFoundError,
	DatabaseUnknownError,
} from '@DatabaseError';

export function handlePrismaError(error: PrismaClientKnownRequestError): never {
	const modelName = error.meta?.modelName;
	const metaRaw = JSON.stringify(error.meta?.driverAdapterError);
	const field = metaRaw.match(/\\"[^_]+_([^\\"]+?)_key\\"/)?.[1];

	switch (error.code) {
		case 'P2002': {
			throw new DatabaseConflictError(
				`Unique ${field} in ${modelName} constraint violated`,
			);
			break;
		}
		case 'P2003': {
			throw new DatabaseConflictError(
				`Foreign key constraint violated on field ${field} in ${modelName}`,
			);
			break;
		}
		case 'P2025': {
			throw new DatabaseNotFoundError(
				`The requested model (${modelName}) was not found`,
			);
			break;
		}
		default:
			throw new DatabaseUnknownError(
				'A database error occurred' + error.message,
			);
	}
}

export async function withPrismaErrorHandling<T>(
	callback: () => Promise<T>,
): Promise<T> {
	try {
		return await callback();
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError) {
			return handlePrismaError(error);
		}
		throw new DatabaseUnknownError((error as Error).message);
	}
}
