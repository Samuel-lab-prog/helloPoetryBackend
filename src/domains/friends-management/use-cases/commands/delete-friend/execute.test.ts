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

	it('throws CannotSendRequestToYourselfError when fromUserId equals toUserId', async () => {
		await expect(
			deleteFriend({ fromUserId: 1, toUserId: 1 }),
		).rejects.toBeInstanceOf(CannotSendRequestToYourselfError);
	});

	it('throws FriendshipNotFoundError when friendship does not exist', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);

		await expect(
			deleteFriend({ fromUserId: 1, toUserId: 2 }),
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
			deleteFriend({ fromUserId: 1, toUserId: 2 }),
		).rejects.toBeInstanceOf(FriendRequestBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});

	it('deletes friendship and returns result', async () => {
		const resultValue = { fromUserId: 1, toUserId: 2 };

		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.deleteFriend.mockResolvedValue(resultValue);

		const result = await deleteFriend({ fromUserId: 1, toUserId: 2 });

		expect(result).toEqual(resultValue);
		expect(commandsRepository.deleteFriend).toHaveBeenCalledWith({
			fromUserId: 1,
			toUserId: 2,
		});
	});
});
