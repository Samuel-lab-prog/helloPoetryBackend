import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

import { makeInteractionsScenario } from '../../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Interactions - ReplyComment', () => {
	describe('Successful execution', () => {
		it('should create a reply', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withFoundComment()
				.withCreatedComment()
				.withCommentReply();
			const result = await scenario.executeReplyComment();
			expect(result).toHaveProperty('id');
		});

		it('should allow exactly 300 characters', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withFoundComment()
				.withCreatedComment()
				.withCommentReply();
			const result = await scenario.executeReplyComment({
				content: 'a'.repeat(300),
			});
			expect(result).toHaveProperty('id');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario.withUser({ exists: false });
			await expectError(scenario.executeReplyComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario.withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario.withUser({
				status: 'banned',
			});
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withFoundComment()
				.withUsersRelation({ areFriends: false, areBlocked: true });
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});
	});

	describe('Parent comment validation', () => {
		it('should throw NotFoundError when parent comment does not exist', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withCommentNotFound();
			await expectError(scenario.executeReplyComment(), NotFoundError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.executeReplyComment(), NotFoundError);
		});

		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ visibility: 'private' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError for poems under moderation', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ moderationStatus: 'pending' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError for rejected poems', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ moderationStatus: 'rejected' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError for removed poems', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ moderationStatus: 'removed' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError for poems that do not allow comments', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ isCommentable: false })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should throw ForbiddenError for unpublished poems', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ status: 'draft' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});
	});

	describe('Reply content validation', () => {
		it('should throw UnprocessableEntityError for empty replies', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withFoundComment();
			await expectError(
				scenario.executeReplyComment({ content: '   ' }),
				UnprocessableEntityError,
			);
		});

		it('should throw UnprocessableEntityError when content exceeds 300 characters', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withFoundComment();
			await expectError(
				scenario.executeReplyComment({ content: 'a'.repeat(301) }),
				UnprocessableEntityError,
			);
		});
	});

	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});

		it('should allow replies on friends-only poems when users are friends', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withFoundComment();
			const result = await scenario.executeReplyComment();
			expect(result).toHaveProperty('id');
		});

		it('should allow owner to reply to their own non-private poem', async () => {
			const scenario = makeInteractionsScenario
				.withUser({ id: 1 })
				.withPoem({ authorId: 1 })
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withFoundComment();
			const result = await scenario.executeReplyComment();
			expect(result).toHaveProperty('id');
		});

		it('should throw ForbiddenError when owner replies to their own private poem', async () => {
			const scenario = makeInteractionsScenario
				.withUser({ id: 1 })
				.withPoem({ authorId: 1, visibility: 'private' })
				.withFoundComment();
			await expectError(scenario.executeReplyComment(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario
				.withUser()
				.withPoem()
				.withFoundComment();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeReplyComment(), Error);
		});
	});
});
