import type { UserReadRepository } from '../ports/ReadRepository';
import type { PublicProfile } from '../read-models/PublicProfile';
import { ProfileNotFoundError } from './errors';

interface Dependencies {
	userReadRepository: UserReadRepository;
}

export function getPublicProfileFactory({ userReadRepository }: Dependencies) {
	return async function getPublicProfile(
		id: number,
		requesterId?: number,
	): Promise<PublicProfile> {
		const profile = await userReadRepository.selectPublicProfile(
			id,
			requesterId,
		);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
