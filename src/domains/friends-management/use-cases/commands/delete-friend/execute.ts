import type { CommandsRepository } from '../../../ports/CommandsRepository';
import { CannotSendRequestToYourselfError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export interface DeleteFriendParams {
	fromUserId: number;
	toUserId: number;
}

export function deleteFriendFactory({ commandsRepository }: Dependencies) {
	return function deleteFriend(
		params: DeleteFriendParams,
	): Promise<{ fromUserId: number; toUserId: number }> {
		const { fromUserId, toUserId } = params;
		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}
		return commandsRepository.deleteFriend({ fromUserId, toUserId });
	};
}
