import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';

import { makeNotificationsScenario } from '../../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Notifications - CreateNotification', () => {
	describe('Successful execution', () => {
		it('should create a notification with all required fields', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInserted();

			const result = await scenario.createNotification({
				type: 'POEM_COMMENT_CREATED',
				actorId: 2,
				entityId: 42,
				entityType: 'POEM',
				data: { commentSnippet: 'Hello World' },
			});

			expect(result).toHaveProperty('id');
			expect(result.type).toBe('POEM_COMMENT_CREATED');
			expect(result.actorId).toBe(2);
			expect(result.entityId).toBe(42);
			expect(result.entityType).toBe('POEM');
			expect(result.aggregatedCount).toBe(1);
			expect(result.data).toEqual({ commentSnippet: 'Hello World' });
			expect(result.createdAt).toBeDefined();
		});

		it('should increment aggregatedCount when notification exists within window', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInserted({
					type: 'POEM_LIKED',
					entityId: 100,
					entityType: 'POEM',
					aggregatedCount: 2,
				});

			const result = await scenario.createNotification({
				type: 'POEM_LIKED',
				actorId: 3,
				entityId: 100,
				entityType: 'POEM',
				aggregateWindowMinutes: 10,
			});

			expect(result.aggregatedCount).toBe(3);
			expect(result.entityId).toBe(100);
			expect(result.entityType).toBe('POEM');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });
			await expectError(
				scenario.createNotification({
					type: 'POEM_COMMENT_CREATED',
				}),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'suspended',
			});

			await expectError(
				scenario.createNotification({
					type: 'POEM_COMMENT_CREATED',
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(
				scenario.createNotification({
					type: 'POEM_COMMENT_CREATED',
				}),
				ForbiddenError,
			);
		});
	});

	describe('Repository errors', () => {
		it('should throw domain error when repository returns failure', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationInsertFailure('INSERT_FAILED');

			await expectError(
				scenario.createNotification({
					type: 'POEM_COMMENT_CREATED',
				}),
				Error,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(
				scenario.createNotification({
					type: 'POEM_COMMENT_CREATED',
				}),
				Error,
			);
		});
	});
});
