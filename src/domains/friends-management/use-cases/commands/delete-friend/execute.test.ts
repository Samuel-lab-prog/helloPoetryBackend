import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { deleteFriendFactory } from './execute';
import { SelfReferenceError, FriendshipNotFoundError } from '../Errors';

describe('USE-CASE - Delete Friend', () => {
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

	it('Does not allow self reference', () => {
		expect(
			deleteFriend({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('Should abort when friendship does not exist', () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);

		expect(
			deleteFriend({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(FriendshipNotFoundError);

		expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith({
			user1Id: 1,
			user2Id: 2,
		});
	});

	it('Should delete friend when no errors occur', () => {
		queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 10 });

		expect(deleteFriend({ requesterId: 1, addresseeId: 2 })).resolves.toEqual({
			requesterId: 1,
			addresseeId: 2,
		});
	});
});
