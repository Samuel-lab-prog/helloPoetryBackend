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
	requesterId: number;
	addresseeId: number;
}

export function acceptFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new CannotSendRequestToYourselfError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			requesterId,
			addresseeId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) {
			throw new RequestNotFoundError();
		}

		const result = await commandsRepository.acceptFriendRequest({
			requesterId,
			addresseeId,
		});

		if (!result) {
			throw new UserNotFoundError();
		}

		return result;
	};
}
