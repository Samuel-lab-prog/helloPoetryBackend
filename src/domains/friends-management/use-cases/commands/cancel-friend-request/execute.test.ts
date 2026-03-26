import { describe, it, expect } from 'bun:test';
import {
	ConflictError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Cancel Friend Request', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeCancelFriendRequest({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Does not allow canceling if the request does not even exist', async () => {
			const scenario = makeFriendsManagementScenario().withNoFriendRequest();

			await expectError(scenario.executeCancelFriendRequest(), NotFoundError);
		});

		it('Should cancel the friend request and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withFriendRequest()
				.withCancelledFriendRequest();

			const result = await scenario.executeCancelFriendRequest();

			expect(result).toHaveProperty('cancellerId', 1);
			expect(result).toHaveProperty('cancelledId', 2);
		});
	});
});
