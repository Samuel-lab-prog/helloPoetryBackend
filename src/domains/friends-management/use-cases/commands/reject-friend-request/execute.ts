import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	RequestNotFoundError,
	FriendRequestBlockedError,
	FriendshipAlreadyExistsError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface RejectFriendRequestParams {
	requesterId: number;
	addresseeId: number;
}

export function rejectFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new CannotSendRequestToYourselfError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			requesterId,
			addresseeId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
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

		return commandsRepository.rejectFriendRequest({
			requesterId,
			addresseeId,
		});
	};
}
