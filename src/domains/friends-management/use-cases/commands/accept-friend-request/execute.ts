import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	RequestNotFoundError,
	FriendshipAlreadyExistsError,
	FriendRequestBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface AcceptFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function acceptFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function acceptFriendRequest(
		params: AcceptFriendRequestParams,
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

		const request = await queriesRepository.findFriendRequest({
			requesterId: fromUserId,
			addresseeId: toUserId,
		});
		if (!request) {
			throw new RequestNotFoundError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			fromUserId,
			toUserId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		const result = await commandsRepository.acceptFriendRequest({
			fromUserId,
			toUserId,
		});

		if (!result) {
			throw new UserNotFoundError();
		}

		return result;
	};
}
