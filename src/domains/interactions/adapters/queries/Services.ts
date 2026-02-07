import { queriesRepository } from '../../infra/queries-repository/Repository';
import type { PoemComment } from '../../use-cases/Models';
import {
	getPoemCommentsFactory,
	type GetPoemCommentsParams,
} from '../../use-cases/queries/Index';
import { poemsServicesForInteractions } from '@SharedKernel/contracts/poems/Index';

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemComment[]>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getPoemComments: getPoemCommentsFactory({
		queriesRepository,
		poemsContract: poemsServicesForInteractions,
	}),
};
