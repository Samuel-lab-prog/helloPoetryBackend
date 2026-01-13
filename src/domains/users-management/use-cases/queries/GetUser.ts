import type { UserReadRepository } from '../../ports/QueriesRepository';
import type { FullUser } from './read-models/FullUser';
import { UserNotFoundError, CrossUserDataAccessError } from './errors';
import type { userRole } from '../../use-cases/queries/read-models/Enums';
import { canAccessUserInfo } from './policies/policies';

export interface Dependencies {
	userReadRepository: UserReadRepository;
}

interface FetchUserParams {
	targetId: number;
	requesterId: number;
	requesterRole: userRole;
}

export function fetchUserFactory({ userReadRepository }: Dependencies) {
	return async function fetchUser(params: FetchUserParams): Promise<FullUser> {
		const canAccess = canAccessUserInfo(params);
		if (!canAccess) {
			throw new CrossUserDataAccessError();
		}

		const user = await userReadRepository.selectUserById(params.targetId);
		if (!user) {
			throw new UserNotFoundError();
		}

		return user;
	};
}
