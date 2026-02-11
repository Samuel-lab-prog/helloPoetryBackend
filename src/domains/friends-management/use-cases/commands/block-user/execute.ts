import type {
	CommandsRepository,
	BlockUserParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { BlockedUserRecord } from '../../Models';
import { SelfReferenceError, UserBlockedError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function blockUserFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function blockUser(
		params: BlockUserParams,
	): Promise<BlockedUserRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		const alreadyBlocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (alreadyBlocked) throw new UserBlockedError();

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (friendship)
			await commandsRepository.deleteFriend(requesterId, addresseeId);

		await commandsRepository.deleteFriendRequestIfExists(
			requesterId,
			addresseeId,
		);

		await commandsRepository.deleteFriendRequestIfExists(
			addresseeId,
			requesterId,
		);

		return commandsRepository.blockUser(requesterId, addresseeId);
	};
}
