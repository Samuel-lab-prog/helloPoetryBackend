import type { FeedItem } from '../use-cases/Models';

export type GetFeedParams = {
	userId: number;
};

export interface QueriesRouterServices {
	getFeed(params: GetFeedParams): Promise<FeedItem[]>;
}
