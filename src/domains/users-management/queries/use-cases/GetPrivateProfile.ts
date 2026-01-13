import type { UserReadRepository } from '../ports/ReadRepository';
import type { PrivateProfile } from '../read-models/PrivateProfile';
import { ProfileNotFoundError } from './errors';

interface Dependencies {
	userReadRepository: UserReadRepository;
}

export function getPrivateProfileFactory({ userReadRepository }: Dependencies) {
	return async function getPrivateProfile(id: number): Promise<PrivateProfile> {
		const profile = await userReadRepository.selectPrivateProfile(id);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
