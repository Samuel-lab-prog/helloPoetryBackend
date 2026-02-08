import type { FeedItem } from '../../use-cases/Models';
import {
	getFeedFactory,
	type GetFeedParams,
} from '../../use-cases/queries/Index';
import { poemsServicesForRecomendationEngine } from '@SharedKernel/contracts/poems/Index';
import { friendsServicesForRecomendationEngine } from '@SharedKernel/contracts/friends/Index';

export interface QueriesRouterServices {
	getFeed(params: GetFeedParams): Promise<FeedItem[]>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getFeed: getFeedFactory({
		poemsServices: poemsServicesForRecomendationEngine,
		friendsServices: friendsServicesForRecomendationEngine,
	}),
};
