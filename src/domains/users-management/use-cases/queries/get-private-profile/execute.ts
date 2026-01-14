import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { PrivateProfile } from '../read-models/PrivateProfile';
import { ProfileNotFoundError } from '../errors';

interface Dependencies {
	userQueriesRepository: userQueriesRepository;
}

export function getPrivateProfileFactory({
	userQueriesRepository,
}: Dependencies) {
	return async function getPrivateProfile(id: number): Promise<PrivateProfile> {
		const profile = await userQueriesRepository.selectPrivateProfile(id);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
