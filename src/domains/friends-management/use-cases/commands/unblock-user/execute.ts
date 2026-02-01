import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	SelfReferenceError,
	BlockedRelationshipNotFoundError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface UnblockUserParams {
	requesterId: number;
	addresseeId: number;
}

export function unblockUserFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function unblockUser(
		params: UnblockUserParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new SelfReferenceError();
		}

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (!blocked) {
			throw new BlockedRelationshipNotFoundError();
		}

		return commandsRepository.unblockUser({
			requesterId,
			addresseeId,
		});
	};
}
