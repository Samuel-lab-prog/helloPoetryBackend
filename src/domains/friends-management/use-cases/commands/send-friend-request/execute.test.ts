import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import {
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	SelfReferenceError,
	UserBlockedError,
} from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - SendFriendRequest', () => {
	describe('Validation', () => {
		it('should not allow self reference', async () => {
			await expectError(
				makeFriendsManagementScenario.executeSendFriendRequest({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should abort when users are blocked', async () => {
			const scenario = makeFriendsManagementScenario.withBlockedRelationship();
			await expectError(scenario.executeSendFriendRequest(), UserBlockedError);
		});

		it('should abort when friendship already exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withFriendship();
			await expectError(
				scenario.executeSendFriendRequest(),
				FriendshipAlreadyExistsError,
			);
		});

		it('should abort when outgoing request already exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookupSequence([{}, null]);
			await expectError(
				scenario.executeSendFriendRequest(),
				RequestAlreadySentError,
			);
		});
	});

	describe('Successful execution', () => {
		it('should accept request when incoming request exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookupSequence([null, {}])
				.withAcceptedFriendRequest();

			const result = await scenario.executeSendFriendRequest();
			expect(result).toHaveProperty('id');
		});

		it('should create friend request when no request exists', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookupSequence([null, null])
				.withCreatedFriendRequest();

			const result = await scenario.executeSendFriendRequest();
			expect(result).toHaveProperty('id');
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withNoBlockedRelationship();
			scenario.mocks.friendsContract.usersRelation.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeSendFriendRequest(), Error);
		});
	});
});
