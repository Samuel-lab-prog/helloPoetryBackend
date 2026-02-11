import type {
	CommandsRepository,
	SuspendUserParams,
} from '../../../ports/Commands';
import type { UsersServicesForModeration } from '../../../ports/ExternalServices';
import type { SuspendedUserResponse } from '../../Models';
import {
	UserNotFoundError,
	UserAlreadySuspendedError,
	InsufficientPermissionsError,
	CannotSuspendSelfError,
} from '../../Errors';
import type { QueriesRepository } from '@Domains/moderation/ports/Queries';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

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
