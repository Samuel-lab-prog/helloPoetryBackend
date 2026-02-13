import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import { SelfReferenceError, UserBlockedError } from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - BlockUser', () => {
	describe('Validation', () => {
		it('should not allow self request', async () => {
			await expectError(
				makeFriendsManagementScenario.executeBlockUser({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should prevent blocking when relationship is already blocked', async () => {
			const scenario = makeFriendsManagementScenario.withBlockedRelationship();
			await expectError(scenario.executeBlockUser(), UserBlockedError);
		});
	});

	describe('Successful execution', () => {
		it('should block user and clean pending requests', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestDeletion()
				.withBlockedUser();

			const result = await scenario.executeBlockUser();
			expect(result).toHaveProperty('id');
			expect(
				scenario.mocks.commandsRepository.deleteFriendRequestIfExists,
			).toHaveBeenCalledTimes(2);
		});

		it('should remove friendship before blocking when users are friends', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withFriendship()
				.withDeletedFriend()
				.withFriendRequestDeletion()
				.withBlockedUser();

			const result = await scenario.executeBlockUser();
			expect(result).toHaveProperty('id');
			expect(scenario.mocks.commandsRepository.deleteFriend).toHaveBeenCalledWith(
				1,
				2,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withNoBlockedRelationship();
			scenario.mocks.queriesRepository.findBlockedRelationship.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeBlockUser(), Error);
		});
	});
});
