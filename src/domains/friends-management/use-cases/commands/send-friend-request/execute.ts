import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	FriendshipAlreadyExistsError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export interface SendFriendRequestParams {
	requesterId: number;
	targetUserId: number;
}

export function sendFriendRequestFactory({ commandsRepository }: Dependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequest> {
		const { requesterId, targetUserId } = params;

		if (requesterId === targetUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const result = await commandsRepository.createFriendRequest({
			fromUserId: requesterId,
			toUserId: targetUserId,
		});
		if (!result) {
			throw new UserNotFoundError();
		}
		if (result.status === 'accepted') {
			throw new FriendshipAlreadyExistsError();
		}
		return result;
	};
}
