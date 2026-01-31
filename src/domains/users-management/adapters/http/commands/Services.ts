import type {
	CreateUser,
	UpdateUserData,
} from '../../../use-cases/commands/models/';

import { commandsRepository } from '../../../infra/commands-repository/repository';
import { BcryptHashService } from '../../../infra/hashing/BcryptHashService';

import {
	updateUserFactory,
	createUserFactory,
} from '../../../use-cases/commands/';

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
		commandsRepository: commandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
};
