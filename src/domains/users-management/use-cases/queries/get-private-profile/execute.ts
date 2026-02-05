import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UserPrivateProfile } from '../../Models';
import { ProfileNotFoundError, UserBannedError } from '../../Errors';
import type { UserStatus } from '@PrismaGenerated/enums';

interface Dependencies {
	queriesRepository: QueriesRepository;
}
// No need to get the requester id since the id comes from the authenticated token
export type GetPrivateProfileParams = {
	requesterId: number;
	requesterStatus: UserStatus;
};

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
