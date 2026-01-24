import type {
	FullClient,
	ClientSummary,
} from '../use-cases/queries/models/Index';

export interface QueriesRepository {
	findClientById(params: { id: number }): Promise<FullClient | null>;
	listAllClients(): Promise<ClientSummary[]>;
	deleteClient(params: { id: number }): Promise<void>;
}
