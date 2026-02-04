import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { CancelFriendRequestRecord } from '../../models/Index';
import { SelfReferenceError, RequestNotFoundError } from '../Errors';

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
	): Promise<CancelFriendRequestRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		// There's no need to check for blocking relationships in both directions
		// since if either user has blocked the other, the request cannot exist.

		// We also don't need to check for existing friendships, since if they were friends,
		// there wouldn't be a pending request to cancel.

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) {
			throw new RequestNotFoundError();
		}

		return commandsRepository.cancelFriendRequest(requesterId, addresseeId);
	};
}
