import { getFeedFactory } from './use-cases/queries/Index';
import { poemsServicesForRecomendationEngine } from '@SharedKernel/contracts/poems/Index';
import { friendsServicesForRecomendationEngine } from '@SharedKernel/contracts/friends/Index';
import { createFeedQueriesRouter } from './adapters/QueriesRouter';
import type { QueriesRouterServices } from './ports/Queries';

export const queriesRouterServices: QueriesRouterServices = {
	getFeed: getFeedFactory({
		poemsServices: poemsServicesForRecomendationEngine,
		friendsServices: friendsServicesForRecomendationEngine,
	}),
};

export const feedQueriesRouter = createFeedQueriesRouter(queriesRouterServices);
