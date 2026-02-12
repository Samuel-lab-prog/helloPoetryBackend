import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

import { makeParams, makeCommentScenario } from '../../TestHelpers';

import { expectError } from 'tests/TestsUtils';

describe.concurrent('USE-CASE - Interactions', () => {
	describe.concurrent('Comment Poem', () => {
		it('creates a comment successfully with trimmed content', async () => {
			const scenario = makeCommentScenario()
				.withValidScenario()
				.withValidComment();
			const result = await scenario.execute(makeParams());
			expect(result).toHaveProperty('id');
		});

		it('does not allow unknown users', () => {
			const scenario = makeCommentScenario().withUnknownUser();
			expectError(scenario.execute(), NotFoundError);
		});

		it('does not allow non-active users', () => {
			const scenario = makeCommentScenario().withSuspendedUser();
			expectError(scenario.execute(), ForbiddenError);
		});

		it('does not allow empty comments', () => {
			const scenario = makeCommentScenario().withValidScenario();
			expectError(
				scenario.execute(makeParams({ content: '   ' })),
				UnprocessableEntityError,
			);
		});

		it('does not allow comments with more than 300 characters', () => {
			const scenario = makeCommentScenario().withValidScenario();
			expectError(
				scenario.execute(makeParams({ content: 'a'.repeat(301) })),
				UnprocessableEntityError,
			);
		});

		it('throws NotFoundError when poem does not exist', () => {
			const scenario = makeCommentScenario().withUnknownPoem();
			expectError(scenario.execute(), NotFoundError);
		});

		it('throws ForbiddenError when users are blocked', () => {
			const scenario = makeCommentScenario()
				.withValidScenario()
				.withUsersBlocked();
			expectError(scenario.execute(), ForbiddenError);
		});

		it('throws ForbiddenError for private poems', () => {
			const scenario = makeCommentScenario().withActiveUser().withPrivatePoem();
			expectError(scenario.execute(), ForbiddenError);
		});

		it('throws ForbiddenError for friends-only poems when not friends', () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withFriendsOnlyPoem();
			expectError(scenario.execute(), ForbiddenError);
		});

		it('allows comments on friends-only poems when users are friends', async () => {
			const scenario = makeCommentScenario()
				.withActiveUser()
				.withFriendsOnlyPoem()
				.withUsersFriends()
				.withValidComment();

			const result = await scenario.execute();
			expect(result).toHaveProperty('id');
		});

		it('does not swallow dependency errors', () => {
			const scenario = makeCommentScenario().withActiveUser();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			expectError(scenario.execute(), Error);
		});
	});
});
