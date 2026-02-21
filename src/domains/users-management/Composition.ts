import { commandsRepository } from './infra/commands-repository/Repository';
import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import type { UsersCommandsServices } from './ports/Commands';
import { createUsersCommandsRouter } from './adapters/CommandsRouter';
import {
	updateUserFactory,
	createUserFactory,
} from './use-cases/commands/Index';
import { getProfileFactory, getUsersFactory } from './use-cases/queries/Index';
import type { UsersQueriesRouterServices } from './ports/Queries';
import { queriesRepository } from './infra/queries-repository/Repository';
import { createUsersReadRouter } from './adapters/QueriesRouter';

const commandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository: commandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
};

const commandsServicesWithFakeHash: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository: commandsRepository,
		hashServices: FakeHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
};

const queriesServices: UsersQueriesRouterServices = {
	getProfile: getProfileFactory({
		queriesRepository: queriesRepository,
	}) as UsersQueriesRouterServices['getProfile'],
	searchUsers: getUsersFactory({
		queriesRepository: queriesRepository,
	}),
};

export const userCommandsRouter = createUsersCommandsRouter(commandsServices);
export const userCommandsRouterWithFakeHash = createUsersCommandsRouter(
	commandsServicesWithFakeHash,
);
export const userQueriesRouter = createUsersReadRouter(queriesServices);
