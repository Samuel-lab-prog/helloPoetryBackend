import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	FriendRequestBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface UnblockFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function unblockFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function unblockFriendRequest(
		params: UnblockFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;

		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			fromUserId,
			toUserId,
		);
		if (!blocked) {
			throw new FriendRequestBlockedError();
		}

		return commandsRepository.unblockFriendRequest({ fromUserId, toUserId });
	};
}
