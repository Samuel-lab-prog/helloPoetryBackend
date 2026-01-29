import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PrivateProfile } from '../models/PrivateProfile';
import { ProfileNotFoundError } from '../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getPrivateProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPrivateProfile(id: number): Promise<PrivateProfile> {
		const profile = await queriesRepository.selectPrivateProfile(id);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
