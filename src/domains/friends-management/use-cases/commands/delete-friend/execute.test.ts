import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import { FriendshipNotFoundError, SelfReferenceError } from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - DeleteFriend', () => {
	describe('Validation', () => {
		it('should not allow self reference', async () => {
			await expectError(
				makeFriendsManagementScenario.executeDeleteFriend({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should abort when friendship does not exist', async () => {
			const scenario = makeFriendsManagementScenario.withNoFriendship();
			await expectError(scenario.executeDeleteFriend(), FriendshipNotFoundError);
		});
	});

	describe('Successful execution', () => {
		it('should delete friendship when users are friends', async () => {
			const scenario = makeFriendsManagementScenario
				.withFriendship()
				.withDeletedFriend();

			const result = await scenario.executeDeleteFriend();
			expect(result).toEqual({ removedById: 1, removedId: 2 });
			expect(scenario.mocks.commandsRepository.deleteFriend).toHaveBeenCalledWith(
				1,
				2,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withFriendship();
			scenario.mocks.commandsRepository.deleteFriend.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeDeleteFriend(), Error);
		});
	});
});
