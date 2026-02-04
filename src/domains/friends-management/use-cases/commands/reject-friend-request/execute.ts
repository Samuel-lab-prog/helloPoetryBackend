import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequestRejectionRecord } from '../../models/Index';
import { SelfReferenceError, RequestNotFoundError } from '../Errors';

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
	): Promise<FriendRequestRejectionRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		// No need to check if blocking relation exists here, since blocking a user
		// automatically removes any pending friend requests between the users

		// We also do not need to check for existing friendship here,
		// since a friend request cannot exist if a friendship already exists

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});

		if (!request) {
			throw new RequestNotFoundError();
		}

		return commandsRepository.rejectFriendRequest(requesterId, addresseeId);
	};
}
