import { describe, it, expect } from 'bun:test';
import { ConflictError } from '@GenericSubdomains/utils/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Send Friend Request', () => {
		it('Does not allow self reference', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeSendFriendRequest({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Should abort when users are blocked', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withBlockedRelationship();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should abort when friendship already exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withFriendship();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should abort when outgoing request already exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequest();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should accept request when incoming request exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookup({ outgoing: null, incoming: {} })
				.withAcceptedFriendRequest();

			const result = await scenario.executeSendFriendRequest();

			expect(result).toHaveProperty('id');
		});

		it('Should create friend request when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookup({ outgoing: null, incoming: null })
				.withCreatedFriendRequest();

			const result = await scenario.executeSendFriendRequest();

			expect(result).toHaveProperty('id');
		});
	});
});
