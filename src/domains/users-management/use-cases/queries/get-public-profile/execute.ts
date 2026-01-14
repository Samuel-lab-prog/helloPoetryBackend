import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { PublicProfile } from '../read-models/PublicProfile';
import { ProfileNotFoundError } from '../errors';

interface Dependencies {
	userQueriesRepository: userQueriesRepository;
}

export function getPublicProfileFactory({
	userQueriesRepository,
}: Dependencies) {
	return async function getPublicProfile(
		id: number,
		requesterId?: number,
	): Promise<PublicProfile> {
		const profile = await userQueriesRepository.selectPublicProfile(
			id,
			requesterId,
		);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
