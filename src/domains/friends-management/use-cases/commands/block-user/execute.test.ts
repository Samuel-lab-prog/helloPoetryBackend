import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { blockUserFactory } from './execute';

import { ConflictError } from '@GenericSubdomains/utils/domainError';

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
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Prevents blocking if one of the users has already blocked the other', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
			queriesRepository.findBlockedRelationship.mockResolvedValue(true);

			expect(
				blockUser({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);

			expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should block the user and return the result when no errors occur', async () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue(null);
			queriesRepository.findBlockedRelationship.mockResolvedValue(false);

			commandsRepository.deleteFriendRequestIfExists.mockResolvedValue({
				ok: true,
			});
			commandsRepository.blockUser.mockResolvedValue({
				ok: true,
				data: { blockerId: 1, blockedId: 2 },
			});

			const result = await blockUser({ requesterId: 1, addresseeId: 2 });
			expect(result).toEqual({ blockerId: 1, blockedId: 2 });
		});
	});
});
