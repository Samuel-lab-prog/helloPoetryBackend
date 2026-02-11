import type {
	QueriesRepository,
	GetPublicProfileParams,
} from '../../../ports/Queries';
import type { UserPublicProfile } from '../../Models';
import { ProfileNotFoundError, UserBannedError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

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
