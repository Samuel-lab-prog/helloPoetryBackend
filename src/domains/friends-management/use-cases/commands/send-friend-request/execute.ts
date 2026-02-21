/* eslint-disable max-lines-per-function */
import type {
	CommandsRepository,
	SendFriendRequestParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { FriendRequestRecord, FriendshipRecord } from '../../Models';
import { ConflictError } from '@DomainError';
import type { EventBus } from '@SharedKernel/events/EventBus';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
	eventBus: EventBus;
}

export function sendFriendRequestFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
	eventBus,
}: Dependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError(
				'Users cannot send friend requests to themselves',
			);

		const addresseeInfo = await usersContract.selectUserBasicInfo(addresseeId);

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});
		if (blocked)
			throw new ConflictError('Cannot send friend request to a blocked user');

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});
		if (friendship) throw new ConflictError('Friendship already exists');

		const existingOutgoingRequest = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (existingOutgoingRequest)
			throw new ConflictError('Friend request already sent');

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
						throw new ConflictError('Friendship already exists');
					case 'NOT_FOUND':
						throw new ConflictError('Friend request not found');
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
					throw new ConflictError('Friend request already sent');
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
