import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UserPrivateProfile } from '../../Models';
import { ProfileNotFoundError } from '../../Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export type GetPrivateProfileParams = {
	id: number;
};

export function getPrivateProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPrivateProfile(
		params: GetPrivateProfileParams,
	): Promise<UserPrivateProfile> {
		const { id } = params;
		const profile = await queriesRepository.selectPrivateProfile(id);
		if (!profile) {
			throw new ProfileNotFoundError();
		}
		return profile;
	};
}
