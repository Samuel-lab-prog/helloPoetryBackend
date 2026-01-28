import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser } from '../read-models/FullUser';
import { UserNotFoundError, CrossUserDataAccessError } from '../errors';
import type { UserRole } from '../read-models/Enums';
import { canAccessUserInfo } from '../policies/policies';

interface Dependencies {
	userQueriesRepository: userQueriesRepository;
}

interface GetUserParams {
	targetId: number;
	requesterId: number;
	requesterRole: UserRole;
}

export function getUserFactory({ userQueriesRepository }: Dependencies) {
	return async function getUser(params: GetUserParams): Promise<FullUser> {
		const canAccess = canAccessUserInfo(params);
		if (!canAccess) {
			throw new CrossUserDataAccessError();
		}

		const user = await userQueriesRepository.selectUserById(params.targetId);
		if (!user) {
			throw new UserNotFoundError();
		}

		return user;
	};
}
