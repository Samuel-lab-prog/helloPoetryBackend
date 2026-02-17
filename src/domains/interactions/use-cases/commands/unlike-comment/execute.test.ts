import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError, ConflictError } from '@DomainError';
import { makeInteractionsScenario } from '../../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Interactions - UnlikeComment', () => {
	describe('Successful execution', () => {
		it('should unlike a comment successfully', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundCommentLike()
				.withCommentLikeCreated();

			const result = await scenario.executeUnlikeComment();
			expect(result).toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeUnlikeComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeUnlikeComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeUnlikeComment(), ForbiddenError);
		});
	});

	describe('Already unliked', () => {
		it('should throw ConflictError when comment was not liked yet', async () => {
			const scenario = makeInteractionsScenario().withUser();
			await expectError(scenario.executeUnlikeComment(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeUnlikeComment(), Error);
		});
	});
});
