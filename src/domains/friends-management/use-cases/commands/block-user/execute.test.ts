import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { blockUserFactory } from './execute';

import { SelfReferenceError, UserBlockedError } from '../../Errors';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let blockUser: any;

	beforeEach(() => {
		commandsRepository = {
			blockUser: mock(),
			deleteFriendRequestIfExists: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
		};

		blockUser = blockUserFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	describe('Block User', () => {
		it('Does not allow self request', () => {
			expect(
				blockUser({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(SelfReferenceError);
		});

		it('Prevents blocking if one of the users has already blocked the other', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
			queriesRepository.findBlockedRelationship.mockResolvedValue(true);

			expect(
				blockUser({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(UserBlockedError);

			expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should block the user and return the result when no errors occur', async () => {
			const blockedUser = { id: 30 };

			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
			queriesRepository.findBlockedRelationship.mockResolvedValue(false);
			commandsRepository.blockUser.mockResolvedValue(blockedUser);

			const result = await blockUser({
				requesterId: 1,
				addresseeId: 2,
			});

			expect(result).toEqual(blockedUser);
			expect(commandsRepository.blockUser).toHaveBeenCalledWith(1, 2);
		});
	});
});
