import { banUserFactory, suspendUserFactory } from './use-cases/commands/Index';
import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRouterServices } from './ports/Commands';
import { createModerationCommandsRouter } from './adapters/CommandsRouter';

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
};

export const moderationCommandsRouter =
	createModerationCommandsRouter(commandsServices);
