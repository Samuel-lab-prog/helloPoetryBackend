import type {
	CommandsRepository,
	DeleteFriendParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { SelfReferenceError, FriendshipNotFoundError } from '../../Errors';
import type { RemovedFriendRecord } from '../../Models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function deleteFriendFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteFriend(
		params: DeleteFriendParams,
	): Promise<RemovedFriendRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (!friendship) throw new FriendshipNotFoundError();

		const result = await commandsRepository.deleteFriend(
			requesterId,
			addresseeId,
		);

		if (!result.ok) throw new Error(result.message);

		return result.data!;
	};
}
