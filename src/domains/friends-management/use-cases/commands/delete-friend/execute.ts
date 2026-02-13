import type {
	CommandsRepository,
	DeleteFriendParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	UsersContractForInteractions,
} from '@Domains/interactions/ports/ExternalServices';
import { SelfReferenceError, FriendshipNotFoundError } from '../../Errors';
import type { RemovedFriendRecord } from '../../Models';
import { validator } from '@SharedKernel/validators/Global';

export interface DeleteFriendDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function deleteFriendFactory({
	commandsRepository,
	usersContract,
	friendsContract,
}: DeleteFriendDependencies) {
	return async function deleteFriend(
		params: DeleteFriendParams,
	): Promise<RemovedFriendRecord> {
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

		const usersRelation = await friendsContract.usersRelation(
			requesterId,
			addresseeId,
		);
		if (!usersRelation.areFriends) throw new FriendshipNotFoundError();

		const result = await commandsRepository.deleteFriend(
			requesterId,
			addresseeId,
		);

		if (!result.ok) {
			if (result.code === 'NOT_FOUND') throw new FriendshipNotFoundError();
			throw new Error(result.message);
		}

		return result.data!;
	};
}
