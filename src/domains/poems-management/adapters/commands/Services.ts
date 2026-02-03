import type { UserRole, UserStatus } from '@SharedKernel/Enums';

import { queriesRepository } from '../../infra/queries-repository/Repository';
import { commandsRepository } from '../../infra/commands-repository/Repository';
import { slugifyService } from '../../infra/slug-service/Execute';
import { usersContract } from '@SharedKernel/contracts/users/Index';

import {
	createPoemFactory,
	updatePoemFactory,
} from '../../use-cases/commands/Index';

import type { CreatePoem, UpdatePoem } from '../../use-cases/commands/Models';

type MetaData = {
	requesterId: number;
	requesterStatus: UserStatus;
	requesterRole: UserRole;
};

export interface CommandsRouterServices {
	createPoem: (params: {
		data: CreatePoem;
		meta: MetaData;
	}) => Promise<{ id: number }>;
	updatePoem: (params: {
		data: UpdatePoem;
		poemId: number;
		meta: MetaData;
	}) => Promise<UpdatePoem>;
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
		usersContract
	}),
};
