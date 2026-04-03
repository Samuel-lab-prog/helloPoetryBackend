import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import type {
	QueriesRepository,
	GetProfileParams,
} from '../../../ports/Queries';
import type { UserPrivateProfile, UserPublicProfile } from '../../Models';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

interface Dependencies {
	queriesRepository: QueriesRepository;
	friendsContract: FriendsPublicContract;
}

export function getProfileFactory({
	queriesRepository,
	friendsContract,
}: Dependencies) {
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
			requesterId,
			requesterRole: params.requesterRole,
			requesterStatus,
		});

		if (!profile) throw new NotFoundError('Profile not found');
		if (!('isFriend' in profile)) return profile;

		const relation = await friendsContract.selectRelation(requesterId, id);

		return {
			...profile,
			isFriend: relation.friends,
			hasBlockedRequester: relation.blockedBy !== null,
			isBlockedByRequester: relation.blockedId !== null,
			isFriendRequester: relation.requestSentByUserId === requesterId,
			hasIncomingFriendRequest: relation.requestSentByUserId === id,
		};
	};
}
