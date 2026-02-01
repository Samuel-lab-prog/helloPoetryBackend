import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { unblockFriendRequestFactory } from './execute';

import {
	BlockedRelationshipNotFoundError,
	SelfReferenceError,
} from '../Errors';

describe('unblockFriendRequest', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let unblockFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			unblockFriendRequest: mock(),
		};

		queriesRepository = {
			findBlockedRelationship: mock(),
		};

		unblockFriendRequest = unblockFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('throws SelfReferenceError when requester equals target', async () => {
		await expect(
			unblockFriendRequest({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('throws BlockedRelationshipNotFoundError when users are not blocked', () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(null);
		expect(
			unblockFriendRequest({ requesterId: 1, addresseeId: 2 }),
		).rejects.toThrow(BlockedRelationshipNotFoundError);
	});

	it('unblocks user when blocked relationship exists', async () => {
		const unblockResult = { requesterId: 1, addresseeId: 2 };

		queriesRepository.findBlockedRelationship.mockResolvedValue({ id: 10 });
		commandsRepository.unblockFriendRequest.mockResolvedValue(unblockResult);

		const result = await unblockFriendRequest({
			requesterId: 1,
			addresseeId: 2,
		});

		expect(result).toEqual(unblockResult);
		expect(commandsRepository.unblockFriendRequest).toHaveBeenCalledWith({
			requesterId: 1,
			addresseeId: 2,
		});
	});
});
