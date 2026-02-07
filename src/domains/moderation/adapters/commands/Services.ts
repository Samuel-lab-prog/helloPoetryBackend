import { commandsRepository } from '../../infra/commands-repository/Repository';
import { queriesRepository } from '../../infra/queries-repository/Repository';
import { usersContract } from '@SharedKernel/contracts/users/Index';
import type {
	SuspendedUserResponse,
	BannedUserResponse,
} from '../../use-cases/Models';
import {
	banUserFactory,
	suspendUserFactory,
	type BanUserParams,
	type SuspendUserParams,
} from '../../use-cases/commands/Index';

export interface CommandsRouterServices {
	banUser(params: BanUserParams): Promise<BannedUserResponse>;
	suspendUser(params: SuspendUserParams): Promise<SuspendedUserResponse>;
}

export const commandsRouterServices: CommandsRouterServices = {
	banUser: banUserFactory({
		commandsRepository,
		queriesRepository,
		usersContract,
	}),
	suspendUser: suspendUserFactory({
		commandsRepository,
		queriesRepository,
		usersContract,
	}),
};
