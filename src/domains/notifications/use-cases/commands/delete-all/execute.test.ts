import { describe, it, expect } from 'bun:test';
import {
	NotFoundError,
	ForbiddenError,
} from '@GenericSubdomains/utils/domainError';
import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@GenericSubdomains/utils/TestUtils';

describe.concurrent('USE-CASE - Notifications - DeleteAllNotifications', () => {
	describe('Successful execution', () => {
		it('should delete all notifications', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withAllNotificationsDeleted();

			await expect(scenario.deleteAllNotifications()).resolves.toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });

			await expectError(scenario.deleteAllNotifications(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.deleteAllNotifications(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.deleteAllNotifications(), ForbiddenError);
		});
	});

	describe('Dependency errors', () => {
		it('should not swallow errors from usersContract', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.deleteAllNotifications(), Error);
		});

		it('should not swallow errors from commandsRepository', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.commandsRepository.deleteAllNotifications.mockRejectedValue(
				new Error('repository failure'),
			);

			await expectError(scenario.deleteAllNotifications(), Error);
		});
	});
});
