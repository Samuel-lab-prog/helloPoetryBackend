import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { rejectFriendRequestFactory } from './execute';

import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	RequestNotFoundError,
	FriendRequestBlockedError,
	FriendshipAlreadyExistsError,
} from '../Errors';

describe('rejectFriendRequest', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let rejectFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			rejectFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
		};

		rejectFriendRequest = rejectFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws CannotSendRequestToYourselfError when requesterId equals addresseeId', async () => {
		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(CannotSendRequestToYourselfError);
	});

	it('throws FriendshipAlreadyExistsError when friendship already exists', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipAlreadyExistsError);

		expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith({
			user1Id: 1,
			user2Id: 2,
		});
	});

	it('throws RequestNotFoundError when friend request does not exist', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue(null);

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(RequestNotFoundError);

		expect(queriesRepository.findFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});

	it('throws FriendRequestBlockedError when users are blocked', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(true);

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendRequestBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});

	it('rejects friend request and returns removed request', async () => {
		const removedRequest = { id: 30 };

		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.rejectFriendRequest.mockResolvedValue(removedRequest);

		const result = await rejectFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(removedRequest);
		expect(commandsRepository.rejectFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});

	it('throws UserNotFoundError when rejectFriendRequest returns null', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.rejectFriendRequest.mockResolvedValue(null);

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});
});
