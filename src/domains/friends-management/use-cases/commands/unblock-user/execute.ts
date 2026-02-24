import type {
	CommandsRepository,
	UnblockUserParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UnblockUserRecord } from '../../Models';
import {
	ConflictError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

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

		if (requesterId === addresseeId)
			throw new ConflictError('Users cannot unblock themselves');

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (!blocked) throw new NotFoundError('Blocked relationship not found');

		const result = await commandsRepository.unblockUser(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			throw new Error(result.message || 'Failed to unblock user');
		}

		return result.data;
	};
}
