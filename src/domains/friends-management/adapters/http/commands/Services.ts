import { commandsRepository } from '../../../infra/commands-repository/Repository';
import type { FriendRequest } from '../../../use-cases/commands/models/Index';
import {
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
} from '../../../use-cases/commands/Index';

export interface CommandsRouterServices {
	sendFriendRequest(params: {
		requesterId: number;
		targetUserId: number;
	}): Promise<FriendRequest>;
	acceptFriendRequest(params: {
		fromUserId: number;
		toUserId: number;
	}): Promise<FriendRequest>;
}

export const commandsRouterServices: CommandsRouterServices = {
	sendFriendRequest: sendFriendRequestFactory({
		commandsRepository,
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
	}),
};
