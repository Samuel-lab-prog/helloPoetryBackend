import { commandsRepository } from '../../../infra/commands-repository/Repository';
import type { FriendRequest } from '../../../use-cases/commands/models/Index';
import { sendFriendRequestFactory } from '../../../use-cases/commands/Index';

export interface CommandsRouterServices {
	sendFriendRequest(params: {
		requesterId: number;
		targetUserId: number;
	}): Promise<FriendRequest>;
}

export const commandsRouterServices: CommandsRouterServices = {
	sendFriendRequest: sendFriendRequestFactory({
		commandsRepository,
	}),
};
