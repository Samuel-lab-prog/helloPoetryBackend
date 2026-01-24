import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullClient, ClientSummary } from '../models/Index';
import type { ClientNotFoundError, ClientValidationError } from '../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export interface GetClientParams {
	id: number;
}

export function getClientFactory({ queriesRepository }: Dependencies) {
	return function getClient(
		params: GetClientParams,
	): Promise<FullClient | ClientSummary | null> {
		console.log(params);
		console.log(queriesRepository);
		return null;
	};
}
