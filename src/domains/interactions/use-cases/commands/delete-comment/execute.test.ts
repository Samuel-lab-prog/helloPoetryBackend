import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { makeInteractionsScenario } from '../../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Interactions - DeleteComment', () => {
	describe('Successful execution', () => {
		it('should delete a comment for the owner', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withFoundComment()
				.withDeletedComment();

			await expect(scenario.executeDeleteComment()).resolves.toBeUndefined();
		});

		it('should allow admin to delete any comment', async () => {
			const scenario = makeInteractionsScenario
				.withUser({ role: 'admin' })
				.withFoundComment()
				.withDeletedComment();
			await expect(scenario.executeDeleteComment()).resolves.toBeUndefined();
		});

		it('should allow moderator to delete any comment', async () => {
			const scenario = makeInteractionsScenario
				.withUser({ role: 'moderator' })
				.withFoundComment()
				.withDeletedComment();
			await expect(scenario.executeDeleteComment()).resolves.toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario.withUser({ exists: false });
			await expectError(scenario.executeDeleteComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is banned or suspended', async () => {
			const bannedScenario = makeInteractionsScenario.withUser({
				status: 'banned',
			});
			await expectError(bannedScenario.executeDeleteComment(), ForbiddenError);
			const suspendedScenario = makeInteractionsScenario.withUser({
				status: 'suspended',
			});
			await expectError(
				suspendedScenario.executeDeleteComment(),
				ForbiddenError,
			);
		});
	});

	describe('Comment validation', () => {
		it('should throw ForbiddenError when user is not the owner and not admin/moderator', async () => {
			const scenario = makeInteractionsScenario
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({ userId: 2 });
			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario.withUser().withFoundComment();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error(
					'Somehing exploded in the server. Please, do not repeat the request otherw bad things will happen with you!',
				),
			);
			await expectError(scenario.executeDeleteComment(), Error);
		});
	});
});
