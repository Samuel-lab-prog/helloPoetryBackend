import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	BlockedRelationshipNotFoundError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface UnblockFriendRequestParams {
	requesterId: number;
	addresseeId: number;
}

export function unblockFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function unblockFriendRequest(
		params: UnblockFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) {
			throw new CannotSendRequestToYourselfError();
		}

		const blocked = await queriesRepository.findBlockedRelationship(
			requesterId,
			addresseeId,
		);

		if (!blocked) {
			throw new BlockedRelationshipNotFoundError();
		}

		return commandsRepository.unblockFriendRequest({
			requesterId,
			addresseeId,
		});
	};
}
