import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type {
	FullClient,
	ClientSummary,
} from '../../../use-cases/queries/models/Index';
import { getClientFactory } from '../../../use-cases/queries/Index';

export interface QueriesRouterServices {
	getClient(params: {
		id: number;
		requesterId: number;
	}): Promise<FullClient | ClientSummary | null>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getClient: getClientFactory({ queriesRepository }),
};
