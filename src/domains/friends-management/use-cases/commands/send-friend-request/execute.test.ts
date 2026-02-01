import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { sendFriendRequestFactory } from './execute';

import {
	SelfReferenceError,
	UserNotFoundError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	UserBlockedError,
} from '../Errors';

describe('sendFriendRequest', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let sendFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			acceptFriendRequest: mock(),
			createFriendRequest: mock(),
		};

		queriesRepository = {
			findBlockedRelationship: mock(),
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
		};

		sendFriendRequest = sendFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws SelfReferenceError when requester equals target', async () => {
		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('throws UserBlockedError when users are blocked', async () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(true);

		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserBlockedError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
			userId1: 1,
			userId2: 2,
		});
	});

	it('throws FriendshipAlreadyExistsError when friendship already exists', async () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });

		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipAlreadyExistsError);

		expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith({
			user1Id: 1,
			user2Id: 2,
		});
	});

	it('throws RequestAlreadySentError when outgoing request already exists', async () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValueOnce({ id: 30 });

		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(RequestAlreadySentError);
	});

	it('accepts existing incoming request and returns accepted request', async () => {
		const acceptedRequest = { id: 50 };

		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({ id: 20 });

		commandsRepository.acceptFriendRequest.mockResolvedValue(acceptedRequest);

		const result = await sendFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(acceptedRequest);
		expect(commandsRepository.acceptFriendRequest).toHaveBeenCalledWith({
			requesterId: 2,
			addresseeId: 1,
		});
	});

	it('throws UserNotFoundError when accepting incoming request fails', async () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({ id: 20 });

		commandsRepository.acceptFriendRequest.mockResolvedValue(null);

		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});

	it('creates friend request and returns it', async () => {
		const createdRequest = { id: 40 };

		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(null);

		commandsRepository.createFriendRequest.mockResolvedValue(createdRequest);

		const result = await sendFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(createdRequest);
		expect(commandsRepository.createFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});

	it('throws UserNotFoundError when createFriendRequest returns null', async () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(false);
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findFriendRequest
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(null);

		commandsRepository.createFriendRequest.mockResolvedValue(null);

		await expect(
			sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});
});
