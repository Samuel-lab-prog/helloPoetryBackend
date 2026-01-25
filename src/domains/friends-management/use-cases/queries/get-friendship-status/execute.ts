import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendshipStatusSnapshot } from '../models/Index';

import { CannotSendRequestToYourselfError } from '../../commands/Errors';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export interface GetFriendshipStatusParams {
	viewerId: number;
	targetUserId: number;
}

export function getFriendshipStatusFactory({
	queriesRepository,
}: Dependencies) {
	return async function getFriendshipStatus(
		params: GetFriendshipStatusParams,
	): Promise<FriendshipStatusSnapshot> {
		const { viewerId, targetUserId } = params;
		if (viewerId === targetUserId) {
			throw new CannotSendRequestToYourselfError();
		}

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			userAId: viewerId,
			userBId: targetUserId,
		});

		if (!friendship) {
			return {
				exists: false,
				status: 'none',
				requesterId: 0,
				canSendRequest: true,
				canAcceptRequest: false,
				canRemoveFriend: false,
			};
		}

		if (friendship.status === 'pending') {
			const sentByViewer = friendship.userAId === viewerId;

			return {
				exists: true,
				status: sentByViewer ? 'pending_sent' : 'pending_received',
				requesterId: friendship.userAId,
				canSendRequest: false,
				canAcceptRequest: !sentByViewer,
				canRemoveFriend: sentByViewer,
			};
		}

		if (friendship.status === 'accepted') {
			return {
				exists: true,
				status: 'friends',
				requesterId: friendship.userAId,
				canSendRequest: false,
				canAcceptRequest: false,
				canRemoveFriend: true,
			};
		}

		return {
			exists: true,
			status: friendship.status,
			requesterId: friendship.userAId,
			canSendRequest: false,
			canAcceptRequest: false,
			canRemoveFriend: false,
		};
	};
}
