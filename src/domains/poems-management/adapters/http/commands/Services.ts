import { queriesRepository } from '@Domains/poems-management/infra/queries-repository/repository';
import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { slugifyService } from '../../../infra/slug-service/execute';

import {
	createPoemFactory,
	updatePoemFactory,
} from '../../../use-cases/commands/Index';
import type {
	CreatePoem,
	UpdatePoem,
} from '../../../use-cases/commands/models/Index';

import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export interface CommandsRouterServices {
	createPoem: (params: {
		data: CreatePoem;
		meta: {
			requesterId: number;
			requesterStatus: UserStatus;
			requesterRole: UserRole;
		};
	}) => Promise<{ id: number }>;
	updatePoem: (params: {
		data: UpdatePoem;
		poemId: number;
		meta: {
			requesterId: number;
			requesterStatus: UserStatus;
			requesterRole: UserRole;
		};
	}) => Promise<UpdatePoem>;
}

export const commandsRouterServices: CommandsRouterServices = {
	createPoem: createPoemFactory({
		commandsRepository: commandsRepository,
		slugService: slugifyService,
	}),
	updatePoem: updatePoemFactory({
		commandsRepository: commandsRepository,
		queriesRepository: queriesRepository,
		slugService: slugifyService,
	}),
};
