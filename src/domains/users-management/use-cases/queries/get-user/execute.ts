import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser, UserRole } from '../../Models';
import { UserNotFoundError, CrossUserDataAccessError } from '../../Errors';
import { canAccessUserInfo } from '../../Policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export type GetUserParams = {
	targetId: number;
	requesterId: number;
	requesterRole: UserRole;
};

export function getUserFactory({ queriesRepository }: Dependencies) {
	return async function getUser(params: GetUserParams): Promise<FullUser> {
		const canAccess = canAccessUserInfo(params);
		if (!canAccess) {
			throw new CrossUserDataAccessError();
		}

		const user = await queriesRepository.selectUserById(params.targetId);
		if (!user) {
			throw new UserNotFoundError();
		}
		return user;
	};
}
