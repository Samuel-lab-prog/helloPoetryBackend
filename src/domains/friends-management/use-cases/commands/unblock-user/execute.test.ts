import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { unblockUserFactory } from './execute';
import {
	ConflictError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let unblockUser: any;

	beforeEach(() => {
		commandsRepository = {
			unblockUser: mock(),
		};

		queriesRepository = {
			findBlockedRelationship: mock(),
		};

		unblockUser = unblockUserFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	describe('Unblock User', () => {
		it('Does not allow self reference', () => {
			expect(
				unblockUser({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when blocked relationship does not exist', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);

			expect(
				unblockUser({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should unblock friend request when relationship exists', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue({ id: 10 });
			commandsRepository.unblockUser.mockResolvedValue({
				ok: true,
				data: { unblockerId: 1, unblockedId: 2, id: 20, createdAt: new Date() },
			});

			const result = await unblockUser({ requesterId: 1, addresseeId: 2 });

			expect(result).toEqual({
				unblockerId: 1,
				unblockedId: 2,
				id: 20,
				createdAt: expect.any(Date),
			});

			expect(commandsRepository.unblockUser).toHaveBeenCalledWith(1, 2);
		});
	});
});
