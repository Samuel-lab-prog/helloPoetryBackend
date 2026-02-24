import { describe, it, expect } from 'bun:test';

import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@GenericSubdomains/utils/testUtils';

describe.concurrent('USE-CASE - Notifications - GetUserNotifications', () => {
	describe('Successful execution', () => {
		it('should return notifications page', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withUserNotifications({
					notifications: [],
					hasMore: false,
				});

			const result = await scenario.executeGetUserNotifications();

			expect(result).toHaveProperty('notifications');
			expect(result).toHaveProperty('hasMore');
		});

		it('should return cursor pagination data', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withUserNotifications({
					notifications: [],
					hasMore: true,
					nextCursor: 42,
				});

			const result = await scenario.executeGetUserNotifications();

			expect(result.hasMore).toBe(true);
			expect(result.nextCursor).toBe(42);
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({
				exists: false,
			});

			await expectError(scenario.executeGetUserNotifications(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.executeGetUserNotifications(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.executeGetUserNotifications(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeGetUserNotifications(), Error);
		});
	});
});
