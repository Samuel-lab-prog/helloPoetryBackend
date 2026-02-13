import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';

import {
	givenUser,
	type UserBasicInfoOverride,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_COMMENT_ID,
	DEFAULT_COMMENT_CONTENT,
	DEFAULT_POEM_ID,

	type InteractionsSutMocks,
	interactionsTestModule,
} from '../../test-helpers/Helper';

import { expectError } from '@TestUtils';
import { deleteCommentFactory } from './execute';
import type { DeleteCommentParams } from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';

function givenDeletedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	commandsRepository.deletePoemComment.mockResolvedValue(undefined);
}

export type SelectCommentByIdOverride = Partial<
	Awaited<ReturnType<QueriesRepository['selectCommentById']>>
>;

function givenFoundComment(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: SelectCommentByIdOverride = {},
) {
	queriesRepository.selectCommentById.mockResolvedValue({
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		createdAt: new Date(),
		...overrides,
	});
}

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
	const { sut: deleteComment, mocks } = interactionsTestModule.makeSut(deleteCommentFactory);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
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
		it('should throw ForbiddenError when user is not the owner and not admin/moderator', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({ userId: 2 });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeDeleteCommentScenario()
				.withUser()
				.withFoundComment();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error(
					'Somehing exploded in the server. Please, do not repeat the request otherw bad things will happen with you!',
				),
			);
			await expectError(scenario.execute(), Error);
		});
	});
});
