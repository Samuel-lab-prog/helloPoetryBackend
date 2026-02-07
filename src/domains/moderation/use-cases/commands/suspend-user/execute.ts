import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { SuspendedUserResponse } from '../../Models';
import {
	UserNotFoundError,
	UserAlreadySuspendedError,
	InsufficientPermissionsError,
	CannotSuspendSelfError,
} from '../../Errors';
import type { QueriesRepository } from '@Domains/moderation/ports/QueriesRepository';
import type { UsersContract } from '@SharedKernel/contracts/users/Index';
import type { UserRole } from '@SharedKernel/Enums';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersContract;
}

export type SuspendUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
};

export function suspendUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function suspendUser(
		params: SuspendUserParams,
	): Promise<SuspendedUserResponse> {
		const { userId, reason, requesterId, requesterRole } = params;

		if (requesterId === userId) throw new CannotSuspendSelfError();

		if (requesterRole === 'author') throw new InsufficientPermissionsError();

		const userExists = await usersContract.getUserBasicInfo(userId);

		if (!userExists.exists) throw new UserNotFoundError();

		const activeSuspension =
			await queriesRepository.selectActiveSuspensionByUserId({ userId });

		if (activeSuspension) throw new UserAlreadySuspendedError();

		return commandsRepository.createSuspension({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
