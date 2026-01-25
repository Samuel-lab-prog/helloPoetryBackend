import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { queriesRepository } from '../../../infra/queries-repository/Repository';
import { usersContract } from '@SharedKernel/contracts/users/Index';
import type {
	UserBan,
	UserSuspension,
} from '../../../use-cases/commands/models/Index';
import {
	banUserFactory,
	suspendUserFactory,
} from '../../../use-cases/commands/Index';

export interface CommandsRouterServices {
	banUser(params: {
		userId: number;
		reason: string;
		requesterId: number;
		requesterRole: string;
	}): Promise<UserBan>;
	suspendUser(params: {
		userId: number;
		reason: string;
		requesterId: number;
		requesterRole: string;
	}): Promise<UserSuspension>;
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
