import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import type {
	QueriesRepository,
	GetProfileParams,
} from '../../../ports/Queries';
import type { UserPrivateProfile, UserPublicProfile } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getProfileFactory({ queriesRepository }: Dependencies) {
	return async function getProfile(
		params: GetProfileParams,
	): Promise<UserPrivateProfile | UserPublicProfile> {
		const { requesterId, requesterStatus, id } = params;

		if (requesterStatus === 'banned')
			throw new ForbiddenError('Banned users cannot view private profiles');

		let isPrivateProfile = false;
		if (requesterId === id) isPrivateProfile = true;

		const profile = await queriesRepository.selectProfile({
			id,
			isPrivate: isPrivateProfile,
		});

		if (!profile) throw new NotFoundError('Profile not found');
		return profile;
	};
}
