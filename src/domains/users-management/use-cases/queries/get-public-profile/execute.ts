import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UserPublicProfile, UserRole, UserStatus } from '../../Models';
import { ProfileNotFoundError, UserBannedError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export type GetPublicProfileParams = {
	id: number;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export function getPublicProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPublicProfile(
		params: GetPublicProfileParams,
	): Promise<UserPublicProfile> {
		const { id, requesterId, requesterStatus } = params;

		if (requesterStatus === 'banned') throw new UserBannedError();
		const profile = await queriesRepository.selectPublicProfile(
			id,
			requesterId,
		);

		if (!profile) throw new ProfileNotFoundError();

		return profile;
	};
}
