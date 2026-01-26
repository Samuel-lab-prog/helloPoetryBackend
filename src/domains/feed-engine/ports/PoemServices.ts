import type { FeedItem } from '../use-cases/queries/models/FeedItem';

export interface PoemsContractForRecomendationEngine {
	getPoemsByAuthorIds(params: {
		authorIds: number[];
		limit?: number;
		offset?: number;
	}): Promise<{
		poems: {
			id: number;
			authorId: number;
			createdAt: Date;
		}[];
	}>;

	getPublicPoems(params: { limit: number; offset?: number }): Promise<{
		poems: {
			id: number;
			authorId: number;
			createdAt: Date;
		}[];
	}>;

	getPoemsByIds(params: { ids: number[] }): Promise<{
		poems: FeedItem[];
	}>;
}
