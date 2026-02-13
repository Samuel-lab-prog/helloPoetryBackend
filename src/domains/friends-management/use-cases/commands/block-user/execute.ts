import type {
	CommandsRepository,
	BlockUserParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	UsersContractForInteractions,
} from '@Domains/interactions/ports/ExternalServices';
import type { BlockedUserRecord } from '../../Models';
import { SelfReferenceError, UserBlockedError } from '../../Errors';
import { validator } from '@SharedKernel/validators/Global';

export interface BlockUserDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function blockUserFactory({
	commandsRepository,
	usersContract,
	friendsContract,
}: BlockUserDependencies) {
	return async function blockUser(
		params: BlockUserParams,
	): Promise<BlockedUserRecord> {
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

		if (requesterToAddressee.areFriends || addresseeToRequester.areFriends) {
			const result = await commandsRepository.deleteFriend(
				requesterId,
				addresseeId,
			);
			if (!result.ok) throw new Error(result.message);
		}

		const req1 = await commandsRepository.deleteFriendRequestIfExists(
			requesterId,
			addresseeId,
		);
		if (!req1.ok) throw new Error(req1.message);

		const req2 = await commandsRepository.deleteFriendRequestIfExists(
			addresseeId,
			requesterId,
		);
		if (!req2.ok) throw new Error(req2.message);

		const blockResult = await commandsRepository.blockUser(
			requesterId,
			addresseeId,
		);
		if (!blockResult.ok) throw new Error(blockResult.message);

		return blockResult.data!;
	};
}
