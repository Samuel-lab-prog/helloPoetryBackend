import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';

import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Notifications - CreateNotification', () => {
	describe('Successful execution', () => {
		it('should create a notification', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInserted();

			const result = await scenario.createNotification();

			expect(result).toHaveProperty('id');
		});

		it('should allow custom params', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInserted();

			const result = await scenario.createNotification({
				type: 'POEM_COMMENT_CREATED',
			});

			expect(result).toHaveProperty('id');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });

			await expectError(scenario.createNotification(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.createNotification(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.createNotification(), ForbiddenError);
		});
	});

	describe('Repository errors', () => {
		it('should throw domain error when repository returns failure', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInsertFailure('INSERT_FAILED');

			await expectError(scenario.createNotification(), Error);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.createNotification(), Error);
		});
	});
});
