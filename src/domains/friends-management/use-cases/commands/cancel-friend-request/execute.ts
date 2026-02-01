import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestNotFoundError,
	UserBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface CancelFriendRequestParams {
	requesterId: number;
	addresseeId: number;
}

export function cancelFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});
		if (blocked) {
			throw new UserBlockedError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) {
			throw new RequestNotFoundError();
		}

		return commandsRepository.cancelFriendRequest({
			requesterId,
			addresseeId,
		});
	};
}
