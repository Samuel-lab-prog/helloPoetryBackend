import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UsersServicesForModeration } from '../../../ports/UsersServices';
import type { BannedUserResponse } from '../../Models';
import {
	UserNotFoundError,
	UserAlreadyBannedError,
	InsufficientPermissionsError,
	CannotBanSelfError,
} from '../../Errors';
import type { UserRole } from '@SharedKernel/Enums';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}
export type BanUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
};

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

		const userExists = await usersContract.getUserBasicInfo(userId);
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
