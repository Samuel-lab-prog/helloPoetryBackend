import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import {
	SelfReferenceError,
	FriendshipNotFoundError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface DeleteFriendParams {
	requesterId: number;
	addresseeId: number;
}

export function deleteFriendFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteFriend(
		params: DeleteFriendParams,
	): Promise<{ requesterId: number; addresseeId: number }> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (!friendship) {
			throw new FriendshipNotFoundError();
		}

		// No need for check if has a blocking relationship in both directions,
		// since if either user has blocked the other, they cannot be friends.

		await commandsRepository.deleteFriend({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		return { requesterId, addresseeId };
	};
}
