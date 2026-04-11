import type {
	CommandsRepository,
	UnsuspendUserParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function unsuspendUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function unsuspendUser(
		params: UnsuspendUserParams,
	): Promise<void> {
		const { userId, requesterId, requesterRole, requesterStatus } = params;

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot unsuspend themselves.');
		}
		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError(
				'You do not have permission to unsuspend users.',
			);
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');

		const activeSuspension =
			await queriesRepository.selectActiveSuspensionByUserId({ userId });
		if (!activeSuspension) throw new NotFoundError('User is not suspended.');

		await commandsRepository.endSuspension({
			suspensionId: activeSuspension.id,
			endAt: new Date(),
		});
	};
}
