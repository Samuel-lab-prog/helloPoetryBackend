import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FriendRequest } from '../models/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export interface AcceptFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function acceptFriendRequestFactory({
	commandsRepository,
}: Dependencies) {
	return function acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;
		return commandsRepository.acceptFriendRequest({ fromUserId, toUserId });
	};
}
