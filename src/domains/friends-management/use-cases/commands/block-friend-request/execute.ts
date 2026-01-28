import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	FriendshipAlreadyExistsError,
	FriendRequestBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface BlockFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function blockFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function blockFriendRequest(
		params: BlockFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;

		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: fromUserId,
			user2Id: toUserId,
		});
		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			fromUserId,
			toUserId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		return commandsRepository.blockFriendRequest({ fromUserId, toUserId });
	};
}
