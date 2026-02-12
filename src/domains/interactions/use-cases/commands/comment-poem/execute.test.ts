import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

import {
	givenPoem,
	givenUser,
	givenUsersRelation,
	makeInteractionsSutWithConfig,
	type UserBasicInfoOverride,
	type PoemInteractionInfoOverride,
	type CreatePoemCommentOverride,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
	DEFAULT_COMMENT_CONTENT,
	type UsersRelationInfoOverride,
	DEFAULT_COMMENT_ID,
	type InteractionsSutMocks,
} from '../../TestHelpers';
import { expectError } from '@TestUtils';
import { commentPoemFactory } from './execute';
import type { CommentPoemParams } from '../../../ports/Commands';

function givenCreatedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
	overrides: CreatePoemCommentOverride = {},
) {
	commandsRepository.createPoemComment.mockResolvedValue({
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		createdAt: new Date(),
		...overrides,
	});
}
	
function makeCreateCommentParams(
	overrides: Partial<CommentPoemParams> = {},
): CommentPoemParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		...overrides,
	};
}

function makeCreateCommentScenario() {
	const { sut: commentPoem, mocks } = makeInteractionsSutWithConfig(
		commentPoemFactory,
		{
			includeCommands: true,
			includePoems: true,
			includeUsers: true,
			includeFriends: true,
		},
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},
		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks.poemsContract, overrides);
			return this;
		},
		withUsersRelation(overrides: UsersRelationInfoOverride = {}) {
			givenUsersRelation(mocks.friendsContract, overrides);
			return this;
		},
		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks.commandsRepository, overrides);
			return this;
		},
		execute(params = makeCreateCommentParams()) {
			return commentPoem(params);
		},
		get mocks() {
			return mocks;
		},
	};
}

describe.concurrent('USE-CASE - Interactions - CommentPoem', () => {
	describe('Successful execution', () => {
		it('should create a comment', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow exactly 300 characters', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
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
				.withUsersRelation({ areFriends: false, areBlocked: true });
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
		it('should throw ForbiddenError for poems under moderation', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError for rejected poems', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ moderationStatus: 'rejected' });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError for removed poems', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ moderationStatus: 'removed' });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError for poems that do not allow comments', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ isCommentable: false });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError for unpublished poems', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ status: 'draft' });
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
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoem({ visibility: 'friends' })

			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should allow comments on friends-only poems when users are friends', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow owner to comment on their own non-private poem', async () => {
			const scenario = makeCreateCommentScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1 })
				.withUsersRelation({ areFriends: false, areBlocked: false })
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
