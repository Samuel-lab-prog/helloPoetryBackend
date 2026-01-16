import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseError,
	ConflictError,
	NotFoundError,
} from '@root/utils/AppError';

function handlePrismaError(error: PrismaClientKnownRequestError): never {
	switch (error.code) {
		case 'P2002': {
			throw ConflictError('An unique constraint would be violated');
			break;
		}
		case 'P2003': {
			throw ConflictError('A foreign key constraint would be violated');
			break;
		}
		case 'P2025': {
			throw NotFoundError('The requested model was not found');
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
