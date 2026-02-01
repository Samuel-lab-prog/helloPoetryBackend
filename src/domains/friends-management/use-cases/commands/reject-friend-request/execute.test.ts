import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { rejectFriendRequestFactory } from './execute';
import {
	SelfReferenceError,
	RequestNotFoundError,
} from '../Errors';

describe('USE-CASE - Reject Friend Request', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let rejectFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			rejectFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendRequest: mock(),
		};

		rejectFriendRequest = rejectFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('Does not allow self reference', () => {
		expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('Should abort when friend request does not exist', () => {
		queriesRepository.findFriendRequest.mockResolvedValue(null);

		expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(RequestNotFoundError);

		expect(queriesRepository.findFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});

	it('Should reject friend request when no errors occur', () => {
		queriesRepository.findFriendRequest.mockResolvedValue({ id: 10 });

		expect(
			rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).resolves.toEqual(undefined)
	});
});
