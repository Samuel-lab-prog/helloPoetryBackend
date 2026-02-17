/* eslint-disable max-lines-per-function */
import type {
	CommandsRepository,
	SendFriendRequestParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { FriendRequestRecord, FriendshipRecord } from '../../Models';
import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	UserBlockedError,
} from '../../Errors';
import { eventBus } from '@SharedKernel/events/EventBus';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function sendFriendRequestFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId) throw new SelfReferenceError();

		const addresseeInfo = await usersContract.selectUserBasicInfo(addresseeId);

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});
		if (blocked) throw new UserBlockedError();

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		if (friendship) throw new FriendshipAlreadyExistsError();

		const existingOutgoingRequest = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (existingOutgoingRequest) throw new RequestAlreadySentError();

		const existingIncomingRequest = await queriesRepository.findFriendRequest({
			requesterId: addresseeId,
			addresseeId: requesterId,
		});

		if (existingIncomingRequest) {
			const accepted = await commandsRepository.acceptFriendRequest(
				addresseeId,
				requesterId,
			);

			if (!accepted.ok) {
				switch (accepted.code) {
					case 'CONFLICT':
						throw new FriendshipAlreadyExistsError();
					case 'NOT_FOUND':
						throw new RequestAlreadySentError();
					default:
						throw new Error(accepted.message);
				}
			}
			eventBus.publish('NEW_FRIEND', {
				newFriendId: addresseeId,
				newFriendNickname: addresseeInfo.nickname,
				userId: requesterId,
			});

			return accepted.data;
		}

		const result = await commandsRepository.createFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			switch (result.code) {
				case 'CONFLICT':
					throw new RequestAlreadySentError();
				default:
					throw new Error(result.message);
			}
		}

		eventBus.publish('NEW_FRIEND_REQUEST', {
			requesterId,
			recipientId: addresseeId,
			requesterNickname: addresseeInfo.nickname,
		});
		return result.data;
	};
}
