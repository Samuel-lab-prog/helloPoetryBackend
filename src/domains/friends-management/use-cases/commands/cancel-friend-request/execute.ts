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

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) throw new RequestNotFoundError();

		const result = await commandsRepository.cancelFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) throw new Error(result.message);

		return result.data!;
	};
}
