import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { UserBan } from '../models/Index';
import {
	UserNotFoundError,
	UserAlreadyBannedError,
	InsufficientPermissionsError,
	CannotBanSelfError,
} from '../Errors';
import type { QueriesRepository } from '@Domains/moderation/ports/QueriesRepository';
import type { UsersContract } from '@SharedKernel/contracts/users/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersContract;
}

export interface BanUserParams {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: string;
}

export function banUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function banUser(params: BanUserParams): Promise<UserBan> {
		const { userId, reason, requesterId, requesterRole } = params;
		const userExists = await usersContract.getUserBasicInfo(userId);

		if (requesterId === userId) {
			throw new CannotBanSelfError();
		}

		if (requesterRole === 'user') {
			throw new InsufficientPermissionsError();
		}

		if (!userExists.exists) {
			throw new UserNotFoundError();
		}

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (activeBan) {
			throw new UserAlreadyBannedError();
		}

		return commandsRepository.createBan({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
