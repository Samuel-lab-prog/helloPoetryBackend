import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	QueriesRepository,
	GetPublicProfileParams,
} from '../../../ports/Queries';
import type { UserPublicProfile } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getPublicProfileFactory({ queriesRepository }: Dependencies) {
	return async function getPublicProfile(
		params: GetPublicProfileParams,
	): Promise<UserPublicProfile> {
		const { id, requesterId, requesterStatus } = params;

		if (requesterStatus === 'banned')
			throw new ForbiddenError('Banned users cannot view public profiles');
		const profile = await queriesRepository.selectPublicProfile(
			id,
			requesterId,
		);

		if (!profile) throw new NotFoundError('User not found');

		return profile;
	};
}
