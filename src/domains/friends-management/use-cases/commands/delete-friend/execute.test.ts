import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { deleteFriendFactory } from './execute';

import {
	CannotSendRequestToYourselfError,
	FriendshipNotFoundError,
	FriendRequestBlockedError,
} from '../Errors';

describe('deleteFriend', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let deleteFriend: any;

	beforeEach(() => {
		commandsRepository = {
			deleteFriend: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findBlockedRelationship: mock(),
		};

		deleteFriend = deleteFriendFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws CannotSendRequestToYourselfError when requesterId equals addresseeId', async () => {
		await expect(
			deleteFriend({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(CannotSendRequestToYourselfError);
	});

	it('throws FriendshipNotFoundError when friendship does not exist', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);

		await expect(
			deleteFriend({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipNotFoundError);

		expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith({
			user1Id: 1,
			user2Id: 2,
		});
	});

	it('throws FriendRequestBlockedError when users are blocked', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(true);

		await expect(
			deleteFriend({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendRequestBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});
});
