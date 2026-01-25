import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { UserSuspension } from '../models/Index';
import {
	UserNotFoundError,
	UserAlreadySuspendedError,
	InsufficientPermissionsError,
	CannotSuspendSelfError,
} from '../Errors';
import type { QueriesRepository } from '@Domains/moderation/ports/QueriesRepository';
import type { UsersContract } from '@SharedKernel/contracts/users/Index';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersContract;
}

export interface SuspendUserParams {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: string;
}

export function suspendUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function suspendUser(
		params: SuspendUserParams,
	): Promise<UserSuspension> {
		const { userId, reason, requesterId, requesterRole } = params;
		const userExists = await usersContract.getUserBasicInfo(userId);

		if (requesterId === userId) {
			throw new CannotSuspendSelfError();
		}

		if (requesterRole === 'user') {
			throw new InsufficientPermissionsError();
		}

		if (!userExists.exists) {
			throw new UserNotFoundError();
		}

		const activeSuspension =
			await queriesRepository.selectActiveSuspensionByUserId({ userId });
		if (activeSuspension) {
			throw new UserAlreadySuspendedError();
		}

		return commandsRepository.createSuspension({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
