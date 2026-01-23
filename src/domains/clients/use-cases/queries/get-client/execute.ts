import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullClient } from '../models/FullClient';
import type { ClientSummary } from '../models/ClientSummary';
import type { ClientNotFoundError, ClientValidationError } from '../Errors';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export interface GetClientParams {
	id: number;
}

export function GetClientFactory({ poemQueriesRepository }: Dependencies) {
	return function getClient(
		params: GetClientParams,
	): Promise<FullClient | ClientSummary | null> {
		console.log(params);
		console.log(poemQueriesRepository);
		return null;
	};
}
