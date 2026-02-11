import type {
	CommandsRepository,
	CancelFriendRequestParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { CancelFriendRequestRecord } from '../../Models';
import { SelfReferenceError, RequestNotFoundError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function cancelFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<CancelFriendRequestRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		// There's no need to check for blocking relationships in both directions
		// since if either user has blocked the other, the request cannot exist.

		// We also don't need to check for existing friendships, since if they were friends,
		// there wouldn't be a pending request to cancel.

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) throw new RequestNotFoundError();

		return commandsRepository.cancelFriendRequest(requesterId, addresseeId);
	};
}
