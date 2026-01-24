import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FriendRequest } from '../models/Index';
import { CannotSendRequestToYourselfError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export interface BlockFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function blockFriendRequestFactory({
	commandsRepository,
}: Dependencies) {
	return function blockFriendRequest(
		params: BlockFriendRequestParams,
	): Promise<FriendRequest> {
		if (params.fromUserId === params.toUserId) {
			throw new CannotSendRequestToYourselfError();
		}
		const { fromUserId, toUserId } = params;
		return commandsRepository.blockFriendRequest({ fromUserId, toUserId });
	};
}
