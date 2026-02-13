import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import { RequestNotFoundError, SelfReferenceError } from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - CancelFriendRequest', () => {
	describe('Validation', () => {
		it('should not allow self request', async () => {
			await expectError(
				makeFriendsManagementScenario.executeCancelFriendRequest({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should not allow canceling when request does not exist', async () => {
			const scenario = makeFriendsManagementScenario.withNoFriendRequest();
			await expectError(
				scenario.executeCancelFriendRequest(),
				RequestNotFoundError,
			);
		});
	});

	describe('Successful execution', () => {
		it('should cancel friend request when it exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withFriendRequest()
				.withCancelledFriendRequest();

			const result = await scenario.executeCancelFriendRequest();
			expect(result).toEqual({ cancellerId: 1, cancelledId: 2 });
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withFriendRequest();
			scenario.mocks.commandsRepository.cancelFriendRequest.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeCancelFriendRequest(), Error);
		});
	});
});
