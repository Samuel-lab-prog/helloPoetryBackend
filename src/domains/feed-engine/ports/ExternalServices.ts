import type { FeedItem } from './Models';

export interface PoemsFeedContract {
	getFeedPoemsByAuthorIds(params: {
		authorIds: number[];
		limit: number;
		cursor?: Date;
	}): Promise<FeedItem[]>;

	getPublicFeedPoems(params: {
		limit: number;
		excludeAuthorIds?: number[];
		excludePoemIds?: number[];
		cursor?: Date;
	}): Promise<FeedItem[]>;
}
