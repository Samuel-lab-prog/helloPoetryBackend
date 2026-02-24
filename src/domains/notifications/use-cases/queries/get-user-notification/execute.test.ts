import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@GenericSubdomains/utils/testUtils';

describe.concurrent('USE-CASE - Notifications - GetNotificationById', () => {
	describe('Successful execution', () => {
		it('should return notification', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationFound();

			const result = await scenario.getNotificationById();

			expect(result).toHaveProperty('id');
		});

		it('should allow custom params', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationFound();

			const result = await scenario.getNotificationById({
				notificationId: 999,
			});

			expect(result).toHaveProperty('id');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });

			await expectError(scenario.getNotificationById(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.getNotificationById(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.getNotificationById(), ForbiddenError);
		});
	});

	describe('Notification validation', () => {
		it('should throw NotFoundError when notification does not exist', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationNotFound();

			await expectError(scenario.getNotificationById(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.getNotificationById(), Error);
		});
	});
});
