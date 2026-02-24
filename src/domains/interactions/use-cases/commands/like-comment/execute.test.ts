import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	ConflictError,
} from '@GenericSubdomains/utils/domainError';
import { makeInteractionsScenario } from '../../test-helpers/Helper';
import { expectError } from '@GenericSubdomains/utils/testUtils';

describe.concurrent('USE-CASE - Interactions - LikeComment', () => {
	describe('Successful execution', () => {
		it('should like a comment successfully', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withCommentLikeCreated();

			const result = await scenario.executeLikeComment();
			expect(result).toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeLikeComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeLikeComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeLikeComment(), ForbiddenError);
		});
	});

	describe('Already liked', () => {
		it('should throw ConflictError when comment is already liked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundCommentLike();
			await expectError(scenario.executeLikeComment(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeLikeComment(), Error);
		});
	});
});
