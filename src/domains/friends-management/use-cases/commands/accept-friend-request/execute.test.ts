import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { acceptFriendRequestFactory } from './execute';

import {
	CannotSendRequestToYourselfError,
	UserNotFoundError,
	RequestNotFoundError,
	FriendshipAlreadyExistsError,
	FriendRequestBlockedError,
} from '../Errors';

describe('acceptFriendRequest', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let acceptFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			acceptFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
		};

		acceptFriendRequest = acceptFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws CannotSendRequestToYourselfError when fromUserId equals toUserId', async () => {
		await expect(
			acceptFriendRequest({ fromUserId: 1, toUserId: 1 }),
		).rejects.toBeInstanceOf(CannotSendRequestToYourselfError);
	});

	it('throws FriendshipAlreadyExistsError when friendship already exists', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });

		await expect(
			acceptFriendRequest({ fromUserId: 1, toUserId: 2 }),
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
			acceptFriendRequest({ fromUserId: 1, toUserId: 2 }),
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
			acceptFriendRequest({ fromUserId: 1, toUserId: 2 }),
		).rejects.toBeInstanceOf(FriendRequestBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith(
			1,
			2,
		);
	});

	it('accepts friend request and returns result', async () => {
		const acceptedRequest = { id: 30 };

		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.acceptFriendRequest.mockResolvedValue(acceptedRequest);

		const result = await acceptFriendRequest({
			fromUserId: 1,
			toUserId: 2,
		});

		expect(result).toEqual(acceptedRequest);
		expect(commandsRepository.acceptFriendRequest).toHaveBeenCalledWith({
			fromUserId: 1,
			toUserId: 2,
		});
	});

	it('throws UserNotFoundError when acceptFriendRequest returns null', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		commandsRepository.acceptFriendRequest.mockResolvedValue(null);

		await expect(
			acceptFriendRequest({ fromUserId: 1, toUserId: 2 }),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});
});
