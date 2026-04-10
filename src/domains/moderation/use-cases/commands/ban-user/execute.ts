import type {
	CommandsRepository,
	BanUserParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UsersServicesForModeration } from '../../../ports/ExternalServices';
import type { BannedUserResponse } from '../../../ports/Models';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';

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

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot ban themselves.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to ban users.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (activeBan) throw new ConflictError('User is already banned.');

		return commandsRepository.createBan({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
