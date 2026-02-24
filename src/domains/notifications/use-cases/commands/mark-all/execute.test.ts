import { describe, it, expect } from 'bun:test';
import {
	NotFoundError,
	ForbiddenError,
} from '@GenericSubdomains/utils/domainError';
import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@GenericSubdomains/utils/testUtils';

describe.concurrent(
	'USE-CASE - Notifications - MarkAllNotificationsAsRead',
	() => {
		describe('Successful execution', () => {
			it('should mark all notifications as read', async () => {
				const scenario = makeNotificationsScenario()
					.withUser()
					.withAllNotificationsMarkedAsRead();

				await expect(scenario.markAllAsRead()).resolves.toBeUndefined();
			});
		});

		describe('User validation', () => {
			it('should throw NotFoundError when user does not exist', async () => {
				const scenario = makeNotificationsScenario().withUser({
					exists: false,
				});

				await expectError(scenario.markAllAsRead(), NotFoundError);
			});

			it('should throw ForbiddenError when user is suspended', async () => {
				const scenario = makeNotificationsScenario().withUser({
					status: 'suspended',
				});

				await expectError(scenario.markAllAsRead(), ForbiddenError);
			});

			it('should throw ForbiddenError when user is banned', async () => {
				const scenario = makeNotificationsScenario().withUser({
					status: 'banned',
				});

				await expectError(scenario.markAllAsRead(), ForbiddenError);
			});
		});

		describe('Dependency errors', () => {
			it('should not swallow errors from usersContract', async () => {
				const scenario = makeNotificationsScenario().withUser();

				scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
					new Error('boom'),
				);

				await expectError(scenario.markAllAsRead(), Error);
			});

			it('should not swallow errors from commandsRepository', async () => {
				const scenario = makeNotificationsScenario().withUser();

				scenario.mocks.commandsRepository.markAllAsRead.mockRejectedValue(
					new Error('repository failure'),
				);

				await expectError(scenario.markAllAsRead(), Error);
			});
		});
	},
);
