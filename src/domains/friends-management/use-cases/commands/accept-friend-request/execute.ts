import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendshipRecord } from '../../models/Index';

import {
	SelfReferenceError,
	RequestNotFoundError,
	FriendshipAlreadyExistsError,
	UserBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface AcceptFriendRequestParams {
	requesterId: number;
	addresseeId: number;
}

export function acceptFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendshipRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (blocked) {
			throw new UserBlockedError();
		}

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});

		if (!request) {
			throw new RequestNotFoundError();
		}

		const result = await commandsRepository.acceptFriendRequest(
			requesterId,
			addresseeId,
		);

		return result;
	};
}
