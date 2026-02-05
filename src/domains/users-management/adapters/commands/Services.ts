import type { FullUser } from '../../use-cases/Models';

import { commandsRepository } from '../../infra/commands-repository/Repository';
import { BcryptHashService } from '../../infra/hashing/BcryptHashService';

import {
	updateUserFactory,
	createUserFactory,
	type CreateUserParams,
	type UpdateUserParams,
} from '../../use-cases/commands/Index';

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<FullUser>;
	updateUser: (params: UpdateUserParams) => Promise<FullUser>;
}

export const commandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository: commandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
};
