import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PublicProfile } from '../models/PublicProfile';
import { ProfileNotFoundError } from '../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getPublicProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPublicProfile(
		id: number,
		requesterId: number,
	): Promise<PublicProfile> {
		const profile = await queriesRepository.selectPublicProfile(
			id,
			requesterId,
		);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
