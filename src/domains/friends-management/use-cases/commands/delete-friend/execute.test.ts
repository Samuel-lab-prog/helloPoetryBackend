import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { deleteFriendFactory } from './execute';
import { ConflictError, NotFoundError } from '@DomainError';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let deleteFriend: any;

	beforeEach(() => {
		commandsRepository = {
			deleteFriend: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
		};

		deleteFriend = deleteFriendFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	describe('Delete Friend', () => {
		it('Does not allow self reference', () => {
			expect(
				deleteFriend({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when friendship does not exist', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);

			expect(
				deleteFriend({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith(
				{
					user1Id: 1,
					user2Id: 2,
				},
			);
		});

		it('Should delete friend when friendship exists', async () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({
				id: 10,
			});

			commandsRepository.deleteFriend.mockResolvedValue({
				ok: true,
				data: { removedById: 1, removedId: 2 },
			});

			const result = await deleteFriend({ requesterId: 1, addresseeId: 2 });

			expect(result).toEqual({ removedById: 1, removedId: 2 });
			expect(commandsRepository.deleteFriend).toHaveBeenCalledWith(1, 2);
		});
	});
});
