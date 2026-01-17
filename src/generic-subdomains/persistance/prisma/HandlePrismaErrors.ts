import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseError,
	ConflictError,
	NotFoundError,
} from '@root/generic-subdomains/utils/AppError';

function handlePrismaError(error: PrismaClientKnownRequestError): never {
	const modelName = error.meta?.modelName;
	const metaRaw = JSON.stringify(error.meta?.driverAdapterError);
	const field = metaRaw.match(/\\"[^_]+_([^\\"]+?)_key\\"/)?.[1];

	switch (error.code) {
		case 'P2002': {
			throw ConflictError(
				`Unique ${field} in ${modelName} constraint violated`,
			);
			break;
		}
		case 'P2003': {
			throw ConflictError(
				`Foreign key constraint violated on field ${field} in ${modelName}`,
			);
			break;
		}
		case 'P2025': {
			throw NotFoundError(`The requested model (${modelName}) was not found`);
			break;
		}
		default:
			throw DatabaseError('A database error occurred' + error.message);
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
		throw DatabaseError((error as Error).message);
	}
}
