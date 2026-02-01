import type {
	CreateUser,
	UpdateUserData,
} from '../../../use-cases/commands/models/Index';

import { commandsRepository } from '../../../infra/commands-repository/repository';
import { BcryptHashService } from '../../../infra/hashing/BcryptHashService';

import {
	updateUserFactory,
	createUserFactory,
} from '../../../use-cases/commands/Index';
import type { FullUser } from '@Domains/users-management/use-cases/queries/models/Index';

export interface UsersCommandsServices {
	createUser: (data: CreateUser) => Promise<FullUser>;
	updateUser: (
		requesterId: number,
		targetId: number,
		data: UpdateUserData,
	) => Promise<FullUser>;
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
