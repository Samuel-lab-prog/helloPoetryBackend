import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/QueriesRepository';
import type {
	FullClient,
	ClientSummary,
} from '../../use-cases/queries/models/Index';
import { clientSelectModel } from './SelectModels.ts';
export const queriesRepository: QueriesRepository = {
	findClientById,
	listAllClients,
	deleteClient,
};

export function findClientById(params: {
	id: number;
}): Promise<FullClient | null> {
	const { id } = params;
	return withPrismaErrorHandling(async () => {
		// Repository implementation goes here
		const client = await prisma.user.findUnique({
			where: { id },
		});
		return client;
	});
}

export function listAllClients(): Promise<ClientSummary[]> {
	return withPrismaErrorHandling(async () => {
		// Repository implementation goes here
		const clients = await prisma.user.findMany({
			select: clientSelectModel,
		});
		return clients;
	});
}

export function deleteClient(params: { id: number }): Promise<void> {
	const { id } = params;
	return withPrismaErrorHandling(async () => {
		// Repository implementation goes here
		await prisma.user.delete({
			where: { id },
		});
	});
}
