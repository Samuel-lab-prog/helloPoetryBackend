import type { FeedItem } from '../use-cases/Models';

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
