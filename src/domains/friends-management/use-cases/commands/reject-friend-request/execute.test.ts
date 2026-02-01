import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { rejectFriendRequestFactory } from './execute';

import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestNotFoundError,
	UserBlockedError,
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

	it('throws SelfReferenceError', async () => {
		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('throws FriendshipAlreadyExistsError', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({});

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipAlreadyExistsError);
	});

	it('throws UserBlockedError', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findBlockedRelationship.mockResolvedValue({});

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(UserBlockedError);
	});

	it('throws RequestNotFoundError', async () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findBlockedRelationship.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue(null);

		await expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(RequestNotFoundError);
	});

	it('rejects request successfully', async () => {
		const resultMock = { requesterId: 1, addresseeId: 2 };

		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
		queriesRepository.findBlockedRelationship.mockResolvedValue(null);
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 3 });
		commandsRepository.rejectFriendRequest.mockResolvedValue(resultMock);

		const result = await rejectFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(resultMock);
	});
});
