import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type { FriendshipStatusSnapshot } from '../../../use-cases/queries/models/Index';
import { getFriendshipStatusFactory } from '../../../use-cases/queries/Index';

export interface QueriesRouterServices {
	getFriendshipStatus(params: {
		viewerId: number;
		targetUserId: number;
	}): Promise<FriendshipStatusSnapshot>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getFriendshipStatus: getFriendshipStatusFactory({
		queriesRepository,
	}),
};
