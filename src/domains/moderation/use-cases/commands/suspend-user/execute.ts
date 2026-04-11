import type {
	CommandsRepository,
	SuspendUserParams,
} from '../../../ports/commands';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import type { SuspendedUserResponse } from '../../../ports/models';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';
import type { QueriesRepository } from '@Domains/moderation/ports/queries';

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

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot suspend themselves.');
		}

		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to ban users.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);

		if (!userExists.exists) throw new NotFoundError('User not found.');

		const activeSuspension =
			await queriesRepository.selectActiveSuspensionByUserId({ userId });

		if (activeSuspension) {
			throw new ConflictError('User is already suspended.');
		}

		return commandsRepository.createSuspension({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
