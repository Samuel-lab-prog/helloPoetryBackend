import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';

import {
	givenCreatedComment,
	givenUser,
	makeInteractionsSutWithConfig,
	type UserBasicInfoOverride,
	type CreatePoemCommentOverride,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_COMMENT_ID,
	type SelectCommentByIdOverride,
	givenFoundComment,
	givenDeletedComment,
} from '../../TestHelpers';

import { expectError } from '@TestUtils';
import { deleteCommentFactory } from './execute';
import type { DeleteCommentParams } from '../../../ports/Commands';

function makeDeleteCommentParams(
	overrides: Partial<DeleteCommentParams> = {},
): DeleteCommentParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		commentId: DEFAULT_COMMENT_ID,
		...overrides,
	};
}

function makeDeleteCommentScenario() {
	const { sut: deleteComment, mocks } = makeInteractionsSutWithConfig(
		deleteCommentFactory,
		{
			includeCommands: true,
			includeQueries: true,
			includeUsers: true,
		},
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},
		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks.commandsRepository, overrides);
			return this;
		},
		withFoundComment(overrides: SelectCommentByIdOverride = {}) {
			givenFoundComment(mocks.queriesRepository, overrides);
			return this;
		},
		withDeletedComment() {
			givenDeletedComment(mocks.commandsRepository);
			return this;
		},
		execute(params = makeDeleteCommentParams()) {
			return deleteComment(params);
		},
		get mocks() {
			return mocks;
		},
	};
}

describe.concurrent('USE-CASE - Interactions - DeleteComment', () => {
	describe('Successful execution', () => {
		it('should delete a comment for the owner', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser()
				.withFoundComment()
				.withDeletedComment();

			await expect(scenario.execute()).resolves.toBeUndefined();
		});

		it('should allow admin to delete any comment', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser({ role: 'admin' })
				.withFoundComment()
				.withDeletedComment();
			await expect(scenario.execute()).resolves.toBeUndefined();
		});

		it('should allow moderator to delete any comment', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser({ role: 'moderator' })
				.withFoundComment()
				.withDeletedComment();
			await expect(scenario.execute()).resolves.toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeDeleteCommentScenario().withUser({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError when user is banned or suspended', async () => {
			const bannedScenario = makeDeleteCommentScenario().withUser({
				status: 'banned',
			});
			await expectError(bannedScenario.execute(), ForbiddenError);
			const suspendedScenario = makeDeleteCommentScenario().withUser({
				status: 'suspended',
			});
			await expectError(suspendedScenario.execute(), ForbiddenError);
		});
	});

	describe('Comment validation', () => {
		it('should throw NotFoundError when comment does not exist', async () => {
			const scenario = makeDeleteCommentScenario().withUser();
			// não chamamos withCreatedComment, então comment é inexistente
			await expectError(scenario.execute(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser()
				.withCreatedComment();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.execute(), Error);
		});
	});
});
