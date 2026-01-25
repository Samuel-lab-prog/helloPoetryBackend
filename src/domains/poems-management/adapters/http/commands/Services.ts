import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { slugifyService } from '../../../infra/slug-service/execute';

import { createPoemFactory } from '../../../use-cases/commands/Index';
import { type CreatePoem } from '../../../use-cases/commands/models/Index';

export interface CommandsRouterServices {
	createPoem: (params: {
		data: CreatePoem;
		meta: {
			requesterId: number;
			requesterStatus: 'active' | 'suspended' | 'banned';
		};
	}) => Promise<{ id: number }>;
}

export const commandsRouterServices: CommandsRouterServices = {
	createPoem: createPoemFactory({
		commandsRepository: commandsRepository,
		slugService: slugifyService,
	}),
};
