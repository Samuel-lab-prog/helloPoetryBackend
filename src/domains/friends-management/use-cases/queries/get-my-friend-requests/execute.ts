import type { QueriesRepository } from '../../../ports/Queries';
import type { FriendRequestsByUser } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getMyFriendRequestsFactory({
	queriesRepository,
}: Dependencies) {
	return function getMyFriendRequests(params: {
		requesterId: number;
	}): Promise<FriendRequestsByUser> {
		return queriesRepository.selectFriendRequestsByUser(params.requesterId);
	};
}
