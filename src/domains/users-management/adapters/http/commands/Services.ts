import type {
	CreateUser,
	UpdateUserData,
} from '../../../use-cases/commands/models/Index';
import type { FullUser, UserStatus } from '../../../use-cases/queries/models/Index';

import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { BcryptHashService } from '../../../infra/hashing/BcryptHashService';

import {
	updateUserFactory,
	createUserFactory,
} from '../../../use-cases/commands/Index';


type UpdateUserParams = {
	ctx: {
		requesterId: number;
		requesterStatus: UserStatus;
	};
	targetId: number;
	data: UpdateUserData;
};
export interface UsersCommandsServices {
	createUser: (data: CreateUser) => Promise<FullUser>;
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
