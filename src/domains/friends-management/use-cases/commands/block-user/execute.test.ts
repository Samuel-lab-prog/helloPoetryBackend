import { describe, it, expect } from 'bun:test';
import { ConflictError } from '@GenericSubdomains/utils/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Block User', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeBlockUser({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Prevents blocking if one of the users has already blocked the other', async () => {
			const scenario = makeFriendsManagementScenario()
				.withBlockedRelationship()
				.withNoFriendship()
				.withNoFriendRequest();

			await expectError(scenario.executeBlockUser(), ConflictError);

			expect(
				scenario.mocks.queriesRepository.findBlockedRelationship,
			).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should block the user and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withNoFriendRequest()
				.withDeletedFriendRequestIfExists()
				.withBlockedUser();

			const result = await scenario.executeBlockUser();

			expect(result).toHaveProperty('blockedById', 1);
			expect(result).toHaveProperty('blockedUserId', 2);
		});
	});
});
