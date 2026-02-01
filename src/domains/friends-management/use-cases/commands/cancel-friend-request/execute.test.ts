import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { cancelFriendRequestFactory } from './execute';

import { RequestNotFoundError, SelfReferenceError } from '../Errors';

describe('USE-CASE - Cancel Friend Request', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let cancelFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			cancelFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendRequest: mock(),
		};

		cancelFriendRequest = cancelFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('Does not allow self request', () => {
		expect(
			cancelFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('Does not allow canceling if the request does not even exist', () => {
		queriesRepository.findFriendRequest.mockResolvedValue(null);

		expect(
			cancelFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(RequestNotFoundError);
	});

	it('Should cancel the friend request and return the result when no errors occur', () => {
		const cancelledRequest = { id: 10, requesterId: 1, addresseeId: 2 };
		queriesRepository.findFriendRequest.mockResolvedValue(cancelledRequest);
		commandsRepository.cancelFriendRequest.mockResolvedValue(cancelledRequest);
		expect(
			cancelFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).resolves.toEqual(cancelledRequest);
	});
});
