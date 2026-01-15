import type { PoemFeedItem } from './PoemFeedItem';

export type PoemsPage = {
	poems: PoemFeedItem[];
	nextCursor?: number;
	hasMore: boolean;
};
