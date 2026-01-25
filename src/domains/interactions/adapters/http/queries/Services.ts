import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type { PoemComment } from '../../../use-cases/queries/models/Index';
import { getPoemCommentsFactory } from '../../../use-cases/queries/Index';
import { poemsContract } from '@Domains/poems-management/contracts/Index';

export interface QueriesRouterServices {
	getPoemComments(params: { poemId: number }): Promise<PoemComment[]>;
}

export const queriesRouterServices: QueriesRouterServices = {
	getPoemComments: getPoemCommentsFactory({ queriesRepository, poemsContract }),
};
