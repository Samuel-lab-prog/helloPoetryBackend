import type { FeedItem } from './Models';

export type GetFeedParams = {
	userId: number;
};

export interface QueriesRouterServices {
	getFeed(params: GetFeedParams): Promise<FeedItem[]>;
}
