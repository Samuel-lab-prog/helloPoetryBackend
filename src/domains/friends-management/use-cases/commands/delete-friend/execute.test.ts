import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { deleteFriendFactory } from './execute';

import {
	SelfReferenceError,
	FriendshipNotFoundError,
	UserBlockedError,
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

	it('throws SelfReferenceError when requesterId equals addresseeId', async () => {
		await expect(
			deleteFriend({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
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

	it('throws UserBlockedError when users are blocked', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(true);

		await expect(
			deleteFriend({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});
});
