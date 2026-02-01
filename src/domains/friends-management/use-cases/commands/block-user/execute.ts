import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import { SelfReferenceError, UserBlockedError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface BlockUserParams {
	requesterId: number;
	addresseeId: number;
}

export function blockUserFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function blockUser(
		params: BlockUserParams,
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
			throw new UserBlockedError(); 
		}

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
		
		await commandsRepository.deleteFriendRequestIfExists({
			requesterId,
			addresseeId,
		});

		await commandsRepository.deleteFriendRequestIfExists({
			requesterId: addresseeId,
			addresseeId: requesterId,
		});

		return commandsRepository.blockUser({
			requesterId,
			addresseeId,
		});
	};
}
