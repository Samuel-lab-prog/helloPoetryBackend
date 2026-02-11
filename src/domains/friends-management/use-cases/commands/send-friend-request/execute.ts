import type {
	CommandsRepository,
	SendFriendRequestParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { FriendRequestRecord, FriendshipRecord } from '../../Models';
import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	UserBlockedError,
} from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function sendFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});
		if (blocked) throw new UserBlockedError();

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		if (friendship) throw new FriendshipAlreadyExistsError();

		const existingOutgoingRequest = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (existingOutgoingRequest) throw new RequestAlreadySentError();

		const existingIncomingRequest = await queriesRepository.findFriendRequest({
			requesterId: addresseeId,
			addresseeId: requesterId,
		});

		if (existingIncomingRequest) {
			const accepted = await commandsRepository.acceptFriendRequest(
				addresseeId,
				requesterId,
			);

			if (!accepted.ok) {
				switch (accepted.code) {
					case 'CONFLICT':
						throw new FriendshipAlreadyExistsError();
					case 'NOT_FOUND':
						throw new RequestAlreadySentError();
					default:
						throw new Error(accepted.message);
				}
			}

			return accepted.data;
		}

		const result = await commandsRepository.createFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			switch (result.code) {
				case 'CONFLICT':
					throw new RequestAlreadySentError();
				default:
					throw new Error(result.message);
			}
		}

		return result.data;
	};
}
