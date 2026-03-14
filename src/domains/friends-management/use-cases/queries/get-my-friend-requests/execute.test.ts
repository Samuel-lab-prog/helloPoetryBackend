import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { getMyFriendRequestsFactory } from './execute';

describe('USE-CASE - Friends Management - GetMyFriendRequests', () => {
	let queriesRepository: any;
	let getMyFriendRequests: any;

	beforeEach(() => {
		queriesRepository = {
			selectFriendRequestsByUser: mock(),
		};

		getMyFriendRequests = getMyFriendRequestsFactory({ queriesRepository });
	});

	it('should return friend requests from repository', async () => {
		const expected = {
			sent: [
				{
					addresseeId: 2,
					addresseeName: 'Ana',
					addresseeNickname: 'ana',
					addresseeAvatarUrl: null,
				},
			],
			received: [
				{
					requesterId: 3,
					requesterName: 'Leo',
					requesterNickname: 'leo',
					requesterAvatarUrl: 'https://cdn.example.com/avatar.png',
				},
			],
		};

		queriesRepository.selectFriendRequestsByUser.mockResolvedValue(expected);

		await expect(getMyFriendRequests({ requesterId: 1 })).resolves.toEqual(
			expected,
		);
	});

	it('should forward requester id to repository', async () => {
		queriesRepository.selectFriendRequestsByUser.mockResolvedValue({
			sent: [],
			received: [],
		});

		await getMyFriendRequests({ requesterId: 10 });

		expect(queriesRepository.selectFriendRequestsByUser).toHaveBeenCalledWith(
			10,
		);
	});

	it('should not swallow dependency errors', async () => {
		queriesRepository.selectFriendRequestsByUser.mockRejectedValue(
			new Error('boom'),
		);

		await expectError(getMyFriendRequests({ requesterId: 1 }), Error);
	});
});
