import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import { SelfReferenceError, UserBlockedError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface BlockFriendRequestParams {
	requesterId: number;
	addresseeId: number;
}

export function blockFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function blockFriendRequest(
		params: BlockFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		const alreadyBlocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (alreadyBlocked) {
			throw new UserBlockedError(); // 403
		}

		// Remove friendship if exists
		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (friendship) {
			await commandsRepository.deleteFriend({
				user1Id: requesterId,
				user2Id: addresseeId,
			});
		}

		// Remove pending request requester -> addressee
		await commandsRepository.deleteFriendRequestIfExists({
			requesterId,
			addresseeId,
		});

		// Remove pending request addressee -> requester
		await commandsRepository.deleteFriendRequestIfExists({
			requesterId: addresseeId,
			addresseeId: requesterId,
		});

		return commandsRepository.blockFriendRequest({
			requesterId,
			addresseeId,
		});
	};
}
