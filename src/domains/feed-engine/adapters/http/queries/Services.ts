import type { FeedItem } from '../../../use-cases/queries/models/Index';
import { getFeedFactory } from '../../../use-cases/queries/Index';
import { poemsServicesForRecomendationEngine } from '@SharedKernel/contracts/poems/Index';
import { friendsServicesForRecomendationEngine } from '@SharedKernel/contracts/friends/Index';

export interface QueriesRouterServices {
	getFeed(params: {
		userId: number;
		page: number;
		pageSize: number;
	}): Promise<FeedItem[]>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getFeed: getFeedFactory({
		poemsServices: poemsServicesForRecomendationEngine,
		friendsServices: friendsServicesForRecomendationEngine,
	}),
};
