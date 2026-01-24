import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FriendRequest } from '../models/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export interface RejectFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function rejectFriendRequestFactory({
	commandsRepository,
}: Dependencies) {
	return function rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;
		return commandsRepository.rejectFriendRequest({ fromUserId, toUserId });
	};
}
