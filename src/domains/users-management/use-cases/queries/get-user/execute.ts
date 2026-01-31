import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser } from '../models/FullUser';
import { UserNotFoundError, CrossUserDataAccessError } from '../Errors';
import type { UserRole } from '../models/Enums';
import { canAccessUserInfo } from '../policies/policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

interface GetUserParams {
	targetId: number;
	requesterId: number;
	requesterRole: UserRole;
}

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
