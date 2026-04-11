import {
	banUserFactory,
	moderatePoemFactory,
	suspendUserFactory,
} from './use-cases/commands/Index';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRouterServices } from './ports/commands';
import { createModerationCommandsRouter } from './adapters/CommandsRouter';
import { eventBus } from '@SharedKernel/events/EventBus';

const commandsServices: CommandsRouterServices = {
	banUser: banUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	suspendUser: suspendUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	moderatePoem: moderatePoemFactory({
		commandsRepository,
		queriesRepository,
		eventBus: eventBus,
	}),
};

export const moderationCommandsRouter =
	createModerationCommandsRouter(commandsServices);
