import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { blockFriendRequestFactory } from './execute';

import {
	CannotSendRequestToYourselfError,
	FriendshipAlreadyExistsError,
	FriendRequestBlockedError,
} from '../Errors';

describe('blockFriendRequest', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let blockFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			blockFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findBlockedRelationship: mock(),
		};

		blockFriendRequest = blockFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws CannotSendRequestToYourselfError when requesterId equals addresseeId', async () => {
		await expect(
			blockFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(CannotSendRequestToYourselfError);
	});

	it('throws FriendshipAlreadyExistsError when friendship already exists', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });

		await expect(
			blockFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipAlreadyExistsError);

		expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith({
			user1Id: 1,
			user2Id: 2,
		});
	});

	it('throws FriendRequestBlockedError when users are already blocked', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findBlockedRelationship.mockResolvedValue(true);

		await expect(
			blockFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendRequestBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});

	it('blocks friend request and returns result', async () => {
		const blockedRequest = { id: 20 };

		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.blockFriendRequest.mockResolvedValue(blockedRequest);

		const result = await blockFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(blockedRequest);
		expect(commandsRepository.blockFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});
});
