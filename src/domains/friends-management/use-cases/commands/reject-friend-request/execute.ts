import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index';
import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	RequestNotFoundError,
	FriendRequestBlockedError,
	FriendshipAlreadyExistsError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

interface RejectFriendRequestParams {
	fromUserId: number;
	toUserId: number;
}

export function rejectFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequest> {
		const { fromUserId, toUserId } = params;

		// 1️⃣ Não pode rejeitar a si mesmo
		if (fromUserId === toUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		// 2️⃣ Checa se já existe amizade
		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: fromUserId,
			user2Id: toUserId,
		});
		if (friendship) {
			throw new FriendshipAlreadyExistsError();
		}

		// 3️⃣ Checa se existe request pendente
		const request = await queriesRepository.findFriendRequest({
			requesterId: fromUserId,
			addresseeId: toUserId,
		});
		if (!request) {
			throw new RequestNotFoundError();
		}

		// 4️⃣ Checa se há bloqueio
		const blocked = await queriesRepository.findBlockedRelationship(
			fromUserId,
			toUserId,
		);
		if (blocked) {
			throw new FriendRequestBlockedError();
		}

		// 5️⃣ Rejeita (remove) o FriendRequest
		const result = await commandsRepository.rejectFriendRequest({
			fromUserId,
			toUserId,
		});
		if (!result) {
			throw new UserNotFoundError();
		}

		return result;
	};
}
