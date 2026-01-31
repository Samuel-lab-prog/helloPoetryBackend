import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	RequestNotFoundError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface CancelFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function cancelFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;

		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const request = await queriesRepository.findFriendRequest({
			requesterId: fromUserId,
			addresseeId: toUserId,
		});

		if (!request) {
			throw new RequestNotFoundError();
		}
		return commandsRepository.cancelFriendRequest({ fromUserId, toUserId });
	};
}
