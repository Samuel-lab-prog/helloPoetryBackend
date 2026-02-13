import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import {
	BlockedRelationshipNotFoundError,
	SelfReferenceError,
} from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - UnblockUser', () => {
	describe('Validation', () => {
		it('should not allow self reference', async () => {
			await expectError(
				makeFriendsManagementScenario.executeUnblockUser({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should abort when blocked relationship does not exist', async () => {
			const scenario = makeFriendsManagementScenario.withNoBlockedRelationship();
			await expectError(
				scenario.executeUnblockUser(),
				BlockedRelationshipNotFoundError,
			);
		});
	});

	describe('Successful execution', () => {
		it('should unblock user when relationship exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withBlockedRelationship()
				.withUnblockedUser();

			const result = await scenario.executeUnblockUser();
			expect(result).toEqual({ unblockerId: 1, unblockedId: 2 });
			expect(scenario.mocks.commandsRepository.unblockUser).toHaveBeenCalledWith(
				1,
				2,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withBlockedRelationship();
			scenario.mocks.commandsRepository.unblockUser.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeUnblockUser(), Error);
		});
	});
});
