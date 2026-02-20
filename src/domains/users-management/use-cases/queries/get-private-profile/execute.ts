import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	QueriesRepository,
	GetPrivateProfileParams,
} from '../../../ports/Queries';
import type { UserPrivateProfile } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getPrivateProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPrivateProfile(
		params: GetPrivateProfileParams,
	): Promise<UserPrivateProfile> {
		const { requesterId, requesterStatus } = params;

		if (requesterStatus === 'banned') throw new ForbiddenError('Banned users cannot view private profiles');

		const profile = await queriesRepository.selectPrivateProfile(requesterId);

		if (!profile) throw new NotFoundError('Private profile not found');
		return profile;
	};
}
