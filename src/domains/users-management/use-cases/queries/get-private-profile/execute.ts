import type {
	QueriesRepository,
	GetPrivateProfileParams,
} from '../../../ports/Queries';
import type { UserPrivateProfile } from '../../Models';
import { ProfileNotFoundError, UserBannedError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getPrivateProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPrivateProfile(
		params: GetPrivateProfileParams,
	): Promise<UserPrivateProfile> {
		const { requesterId, requesterStatus } = params;

		if (requesterStatus === 'banned') throw new UserBannedError();

		const profile = await queriesRepository.selectPrivateProfile(requesterId);

		if (!profile) throw new ProfileNotFoundError();
		return profile;
	};
}
