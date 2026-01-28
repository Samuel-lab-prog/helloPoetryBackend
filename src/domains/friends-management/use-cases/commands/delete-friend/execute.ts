import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import {
	CannotSendRequestToYourselfError,
	FriendshipNotFoundError,
	FriendRequestBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface DeleteFriendParams {
	fromUserId: number;
	toUserId: number;
}

export function deleteFriendFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteFriend(
		params: DeleteFriendParams,
	): Promise<{ fromUserId: number; toUserId: number }> {
		const { fromUserId, toUserId } = params;

		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: fromUserId,
			user2Id: toUserId,
		});
		if (!friendship) {
			throw new FriendshipNotFoundError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			fromUserId,
			toUserId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		return commandsRepository.deleteFriend({ fromUserId, toUserId });
	};
}
