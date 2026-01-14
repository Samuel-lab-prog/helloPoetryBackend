import type { CreateUser } from '../../../use-cases/commands/commands-models/Create';
import type { UpdateUserData } from '../../../use-cases/commands/commands-models/Update';

import { CommandsRepository } from '../../../infra/commands-repository/repository';
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

export const usersCommandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		userCommandsRepository: CommandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		userCommandsRepository: CommandsRepository,
	}),
};
