import type { CreateUser } from '../../../use-cases/commands/models/Create';
import type { UpdateUserData } from '../../../use-cases/commands/models/Update';

import { commandsRepository } from '../../../infra/commands-repository/repository';
import { BcryptHashService } from '../../../infra/hashing/BcryptHashService';

import {
	updateUserFactory,
	createUserFactory,
} from '../../../use-cases/commands/index';

export interface UsersCommandsServices {
	createUser: (data: CreateUser) => Promise<{ id: number }>;
	updateUser: (
		requesterId: number,
		targetId: number,
		data: UpdateUserData,
	) => Promise<{ id: number }>;
}

export const commandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		userCommandsRepository: commandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		userCommandsRepository: commandsRepository,
	}),
};
