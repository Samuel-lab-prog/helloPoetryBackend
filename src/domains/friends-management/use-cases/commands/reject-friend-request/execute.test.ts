import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import { RequestNotFoundError, SelfReferenceError } from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - RejectFriendRequest', () => {
	describe('Validation', () => {
		it('should not allow self reference', async () => {
			await expectError(
				makeFriendsManagementScenario.executeRejectFriendRequest({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should abort when friend request does not exist', async () => {
			const scenario = makeFriendsManagementScenario.withNoFriendRequest();
			await expectError(
				scenario.executeRejectFriendRequest(),
				RequestNotFoundError,
			);
		});
	});

	describe('Successful execution', () => {
		it('should reject request when it exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withFriendRequest()
				.withRejectedFriendRequest();

			const result = await scenario.executeRejectFriendRequest();
			expect(result).toEqual({ rejecterId: 1, rejectedId: 2 });
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withFriendRequest();
			scenario.mocks.commandsRepository.rejectFriendRequest.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeRejectFriendRequest(), Error);
		});
	});
});
