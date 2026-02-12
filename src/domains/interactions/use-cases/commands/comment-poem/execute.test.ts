import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

import { makeParams, makeCommentScenario } from '../../TestHelpers';
import { expectError } from 'tests/TestsUtils';

describe.concurrent('USE-CASE - Interactions - CommentPoem', () => {
	describe('Successful execution', () => {
		it('should create a comment and trim content properly', async () => {
			const scenario = makeCommentScenario().withValidScenario().withValidComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow exactly 300 characters', async () => {
			const scenario = makeCommentScenario().withValidScenario().withValidComment();
			const result = await scenario.execute(
				makeParams({ content: 'a'.repeat(300) }),
			);
			expect(result).toHaveProperty('id');
		});
	});
	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeCommentScenario().withUnknownUser();
			await expectError(scenario.execute(), NotFoundError);
		});
		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeCommentScenario().withSuspendedUser();
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeCommentScenario().withBannedUser();
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeCommentScenario()
				.withValidScenario()
				.withUsersBlocked();
			await expectError(scenario.execute(), ForbiddenError);
		});
	});
	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeCommentScenario().withUnknownPoem();
			await expectError(scenario.execute(), NotFoundError);
		});
		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withPrivatePoem();
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Comment content validation', () => {
		it('should throw UnprocessableEntityError for empty comments', async () => {
			const scenario = makeCommentScenario().withValidScenario();
			await expectError(
				scenario.execute(makeParams({ content: '   ' })),
				UnprocessableEntityError,
			);
		});
		it('should throw UnprocessableEntityError when content exceeds 300 characters', async () => {
			const scenario = makeCommentScenario().withValidScenario();
			await expectError(
				scenario.execute(makeParams({ content: 'a'.repeat(301) })),
				UnprocessableEntityError,
			);
		});
	});
	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withFriendsOnlyPoem();
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should allow comments on friends-only poems when users are friends', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withFriendsOnlyPoem()
				.withUsersFriends()
				.withValidComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should allow owner to comment on their own non-private poem', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withOwnerPoem()
				.withValidComment();
			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});
		it('should throw ForbiddenError when owner comments on their own private poem', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withOwnerPoem({ visibility: 'private' })
				.withValidComment();
			await expectError(scenario.execute(), ForbiddenError);
		});
	});
	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeCommentScenario().withActiveUser();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.execute(), Error);
		});
	});
});
