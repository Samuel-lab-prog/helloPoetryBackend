import type {
	CommandsRepository,
	BanUserParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UsersServicesForModeration } from '../../../ports/ExternalServices';
import type { BannedUserResponse } from '../../Models';
import {
	UserNotFoundError,
	UserAlreadyBannedError,
	InsufficientPermissionsError,
	CannotBanSelfError,
} from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function banUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function banUser(
		params: BanUserParams,
	): Promise<BannedUserResponse> {
		const { userId, reason, requesterId, requesterRole } = params;

		if (requesterId === userId) throw new CannotBanSelfError();
		if (requesterRole === 'author') throw new InsufficientPermissionsError();

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new UserNotFoundError();

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (activeBan) throw new UserAlreadyBannedError();

		return commandsRepository.createBan({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
