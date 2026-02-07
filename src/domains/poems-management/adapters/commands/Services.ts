import { queriesRepository } from '../../infra/queries-repository/Repository';
import { commandsRepository } from '../../infra/commands-repository/Repository';
import { slugifyService } from '../../infra/slug-service/Execute';
import { usersContract } from '@SharedKernel/contracts/users/Index';

import {
	createPoemFactory,
	updatePoemFactory,
	type CreatePoemParams,
	type UpdatePoemParams,
} from '../../use-cases/commands/Index';

import type {
	CreatePoemResult,
	UpdatePoemResult,
} from '../../use-cases/Models';

export interface CommandsRouterServices {
	createPoem: (params: CreatePoemParams) => Promise<CreatePoemResult>;
	updatePoem: (params: UpdatePoemParams) => Promise<UpdatePoemResult>;
}

export const commandsRouterServices: CommandsRouterServices = {
	createPoem: createPoemFactory({
		commandsRepository,
		slugService: slugifyService,
		usersContract,
	}),
	updatePoem: updatePoemFactory({
		commandsRepository,
		queriesRepository,
		slugService: slugifyService,
		usersContract,
	}),
};
