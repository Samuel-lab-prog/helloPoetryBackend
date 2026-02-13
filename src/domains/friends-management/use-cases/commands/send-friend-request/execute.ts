import type {
	CommandsRepository,
	SendFriendRequestParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	UsersContractForInteractions,
} from '@Domains/interactions/ports/ExternalServices';
import type { FriendRequestRecord, FriendshipRecord } from '../../Models';
import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	UserBlockedError,
} from '../../Errors';
import { validator } from '@SharedKernel/validators/Global';

export interface SendFriendRequestDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function sendFriendRequestFactory({
	commandsRepository,
	usersContract,
	friendsContract,
}: SendFriendRequestDependencies) {
	return async function sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord> {
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

		const accepted = await commandsRepository.acceptFriendRequest(
			addresseeId,
			requesterId,
		);

		if (accepted.ok) return accepted.data;

		switch (accepted.code) {
			case 'CONFLICT':
				throw new FriendshipAlreadyExistsError();
			case 'NOT_FOUND':
				break;
			default:
				throw new Error(accepted.message);
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
		return result.data;
	};
}
