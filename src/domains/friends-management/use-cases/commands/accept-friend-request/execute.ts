import type {
	CommandsRepository,
	AcceptFriendRequestParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	UsersContractForInteractions,
} from '@Domains/interactions/ports/ExternalServices';
import type { FriendshipRecord } from '../../Models';
import {
	SelfReferenceError,
	RequestNotFoundError,
	FriendshipAlreadyExistsError,
	UserBlockedError,
} from '../../Errors';
import { validator } from '@SharedKernel/validators/Global';

export interface AcceptFriendRequestDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function acceptFriendRequestFactory({
	commandsRepository,
	usersContract,
	friendsContract,
}: AcceptFriendRequestDependencies) {
	return async function acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendshipRecord> {
		const { requesterId, addresseeId } = params;
		const v = validator();

		v.ensureResource(requesterId).notUndefined().notNull().minValue(1);
		v.ensureResource(addresseeId).notUndefined().notNull().minValue(1);
		if (requesterId === addresseeId) throw new SelfReferenceError();

		const [requesterInfo, addresseeInfo] = await Promise.all([
			usersContract.getUserBasicInfo(requesterId),
			usersContract.getUserBasicInfo(addresseeId),
		]);
		v.user(requesterInfo).withStatus(['active']);
		v.user(addresseeInfo).withStatus(['active']);

		const [requesterToAddressee, addresseeToRequester] = await Promise.all([
			friendsContract.usersRelation(requesterId, addresseeId),
			friendsContract.usersRelation(addresseeId, requesterId),
		]);
		if (requesterToAddressee.areBlocked || addresseeToRequester.areBlocked)
			throw new UserBlockedError();
		if (requesterToAddressee.areFriends || addresseeToRequester.areFriends)
			throw new FriendshipAlreadyExistsError();

		const result = await commandsRepository.acceptFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			switch (result.code) {
				case 'CONFLICT':
					throw new FriendshipAlreadyExistsError();

				case 'NOT_FOUND':
					throw new RequestNotFoundError();

				default:
					throw new Error(result.message);
			}
		}

		return result.data;
	};
}
