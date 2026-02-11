import type {
	CommandsRepository,
	UnblockUserParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UnblockUserRecord } from '../../Models';
import {
	SelfReferenceError,
	BlockedRelationshipNotFoundError,
} from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function unblockUserFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function unblockUser(
		params: UnblockUserParams,
	): Promise<UnblockUserRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (!blocked) throw new BlockedRelationshipNotFoundError();

		return commandsRepository.unblockUser(requesterId, addresseeId);
	};
}
