import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { rejectFriendRequestFactory } from './execute';
import {
	ConflictError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

describe('USE-CASE - Friends Management', () => {
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
	describe('Reject Friend Request', () => {
		it('Does not allow self reference', () => {
			expect(
				rejectFriendRequest({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when friend request does not exist', () => {
			queriesRepository.findFriendRequest.mockResolvedValue(null);

			expect(
				rejectFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(queriesRepository.findFriendRequest).toHaveBeenCalledWith({
				requesterId: 1,
				addresseeId: 2,
			});
		});

		it('Should reject friend request when no errors occur', async () => {
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 10 });

			commandsRepository.rejectFriendRequest.mockResolvedValue({
				ok: true,
				data: { rejectedId: 2, rejecterId: 1 },
			});

			const result = await rejectFriendRequest({
				requesterId: 1,
				addresseeId: 2,
			});

			expect(result).toEqual({ rejectedId: 2, rejecterId: 1 });
		});
	});
});
