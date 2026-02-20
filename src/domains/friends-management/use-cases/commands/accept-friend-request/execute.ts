import { ConflictError, NotFoundError } from '@DomainError';
import type {
	CommandsRepository,
	AcceptFriendRequestParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { FriendshipRecord } from '../../Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { eventBus } from '@SharedKernel/events/EventBus';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function acceptFriendRequestFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendshipRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError(
				'Users cannot accept friend requests from themselves',
			);
		const addresseeInfo = await usersContract.selectUserBasicInfo(addresseeId);
		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (friendship) throw new ConflictError('Friendship already exists');

		const blocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (blocked) throw new ConflictError('Users are blocked');

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});

		if (!request) throw new NotFoundError('Friend request not found');

		const result = await commandsRepository.acceptFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			switch (result.code) {
				case 'CONFLICT':
					throw new ConflictError('Friendship already exists');

				case 'NOT_FOUND':
					throw new NotFoundError('Friend request not found');

				default:
					throw new Error(result.message);
			}
		}
		eventBus.publish('NEW_FRIEND', {
			newFriendId: requesterId,
			newFriendNickname: addresseeInfo.nickname,
			userId: addresseeId,
		});
		return result.data;
	};
}
