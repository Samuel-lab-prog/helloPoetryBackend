import { describe, expect, it } from 'bun:test';
import { expectError } from '@TestUtils';
import {
	FriendshipAlreadyExistsError,
	RequestNotFoundError,
	SelfReferenceError,
	UserBlockedError,
} from '../../Errors';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Friends Management - AcceptFriendRequest', () => {
	describe('Validation', () => {
		it('should not allow self request', async () => {
			await expectError(
				makeFriendsManagementScenario.executeAcceptFriendRequest({
					requesterId: 1,
					addresseeId: 1,
				}),
				SelfReferenceError,
			);
		});
	});

	describe('Business rules', () => {
		it('should not allow accepting when friendship already exists', async () => {
			const scenario = makeFriendsManagementScenario.withFriendship();
			await expectError(
				scenario.executeAcceptFriendRequest(),
				FriendshipAlreadyExistsError,
			);
		});

		it('should not allow accepting when users are blocked', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoFriendship()
				.withBlockedRelationship();
			await expectError(scenario.executeAcceptFriendRequest(), UserBlockedError);
		});

		it('should not allow accepting when request does not exist', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoFriendship()
				.withNoBlockedRelationship()
				.withNoFriendRequest();
			await expectError(
				scenario.executeAcceptFriendRequest(),
				RequestNotFoundError,
			);
		});
	});

	describe('Successful execution', () => {
		it('should accept request when all checks pass', async () => {
			const scenario = makeFriendsManagementScenario
				.withNoFriendship()
				.withNoBlockedRelationship()
				.withFriendRequest()
				.withAcceptedFriendRequest();

			const result = await scenario.executeAcceptFriendRequest();
			expect(result).toHaveProperty('id');
			expect(scenario.mocks.commandsRepository.acceptFriendRequest).toHaveBeenCalledWith(
				1,
				2,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeFriendsManagementScenario.withNoFriendship();
			scenario.mocks.queriesRepository.findFriendshipBetweenUsers.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeAcceptFriendRequest(), Error);
		});
	});
});
