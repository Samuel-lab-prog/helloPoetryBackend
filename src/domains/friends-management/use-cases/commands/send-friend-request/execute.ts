import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	FriendRequestBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface SendFriendRequestParams {
	requesterId: number;
	targetUserId: number;
}

export function sendFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, targetUserId } = params;

		if (requesterId === targetUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			requesterId,
			targetUserId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: targetUserId,
		});
		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		const existingIncomingRequest = await queriesRepository.findFriendRequest({
			requesterId: targetUserId,
			addresseeId: requesterId,
		});
		if (existingIncomingRequest) {
			const accepted = await commandsRepository.acceptFriendRequest({
				fromUserId: targetUserId,
				toUserId: requesterId,
			});
			if (!accepted) throw new UserNotFoundError();
			return accepted;
		}

		const existingRequest = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId: targetUserId,
		});
		if (existingRequest) {
			throw new RequestAlreadySentError();
		}

		const result = await commandsRepository.createFriendRequest({
			fromUserId: requesterId,
			toUserId: targetUserId,
		});

		if (!result) {
			throw new UserNotFoundError();
		}

		return result;
	};
}
