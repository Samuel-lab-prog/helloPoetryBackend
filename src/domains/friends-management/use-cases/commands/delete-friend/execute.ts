import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import {
	SelfReferenceError,
	FriendshipNotFoundError,
	UserBlockedError,
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

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});
		if (blocked) {
			throw new UserBlockedError();
		}
		await commandsRepository.deleteFriend({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		return { requesterId, addresseeId };
	};
}
