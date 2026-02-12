import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

import {
	makeCreateCommentParams,
	makeCreateCommentScenario,
} from '../../TestHelpers';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Interactions - CommentPoem', () => {
	describe('Successful execution', () => {
		it('should create a comment', async () => {
			const scenario = makeCreateCommentScenario().withCreatedComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow exactly 300 characters', async () => {
			const scenario = makeCreateCommentScenario().withCreatedComment();
			const result = await scenario.execute(
				makeCreateCommentParams({ content: 'a'.repeat(300) }),
			);
			expect(result).toHaveProperty('id');
		});
	});
	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeCreateCommentScenario().withUser({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});
		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeCreateCommentScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeCreateCommentScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem()
				.withUsersBlocked();
			await expectError(scenario.execute(), ForbiddenError);
		});
	});
	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});
		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ visibility: 'private' });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Comment content validation', () => {
		it('should throw UnprocessableEntityError for empty comments', async () => {
			const scenario = makeCreateCommentScenario().withUser().withPoem();
			await expectError(
				scenario.execute(makeCreateCommentParams({ content: '   ' })),
				UnprocessableEntityError,
			);
		});
		it('should throw UnprocessableEntityError when content exceeds 300 characters', async () => {
			const scenario = makeCreateCommentScenario().withUser().withPoem();
			await expectError(
				scenario.execute(makeCreateCommentParams({ content: 'a'.repeat(301) })),
				UnprocessableEntityError,
			);
		});
	});
	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ visibility: 'friends' });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should allow comments on friends-only poems when users are friends', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersFriends()
				.withCreatedComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow owner to comment on their own non-private poem', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1 })
				.withCreatedComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should throw ForbiddenError when owner comments on their own private poem', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1, visibility: 'private' })
				.withCreatedComment();
			await expectError(scenario.execute(), ForbiddenError);
		});
	});
	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeCreateCommentScenario().withUser().withPoem();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.execute(), Error);
		});
	});
});
