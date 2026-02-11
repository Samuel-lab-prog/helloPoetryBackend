import { banUserFactory, suspendUserFactory } from './use-cases/commands/Index';
import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';
import { usersContract } from '@SharedKernel/contracts/users/Index';
import type { CommandsRouterServices } from './ports/Commands';
import { createModerationCommandsRouter } from './adapters/CommandsRouter';

const commandsServices: CommandsRouterServices = {
	banUser: banUserFactory({
		commandsRepository,
		usersContract,
		queriesRepository,
	}),
	suspendUser: suspendUserFactory({
		commandsRepository,
		usersContract,
		queriesRepository,
	}),
};

export const moderationCommandsRouter =
	createModerationCommandsRouter(commandsServices);
