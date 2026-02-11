import { commandsRepository } from '@Domains/users-management/infra/commands-repository/Repository';
import {
	BcryptHashService,
	FakeHashService,
} from '@Domains/users-management/infra/hashing/BcryptHashService';
import type { UsersCommandsServices } from '@Domains/users-management/ports/commands/Services';
import { createUsersCommandsRouter } from '@Domains/users-management/adapters/commands/Router';
import {
	updateUserFactory,
	createUserFactory,
} from '@Domains/users-management/use-cases/commands/Index';

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

export const userCommandsRouter = createUsersCommandsRouter(commandsServices);
export const userCommandsRouterWithFakeHash = createUsersCommandsRouter(
	commandsServicesWithFakeHash,
);
