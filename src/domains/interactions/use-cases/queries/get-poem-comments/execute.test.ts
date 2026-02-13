import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';

import {
	givenPoem,
	givenUser,
	givenUsersRelation,
	type UserBasicInfoOverride,
	type PoemInteractionInfoOverride,
	type UsersRelationInfoOverride,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
	type InteractionsSutMocks,
	interactionsTestModule,
} from '../../test-helpers/Helper';

import { expectError } from '@TestUtils';
import { getPoemCommentsFactory } from './execute';
import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/Queries';

type FindCommentsOverride = Partial<
	Awaited<ReturnType<QueriesRepository['findCommentsByPoemId']>>[number]
>;

function givenExistingComments(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: FindCommentsOverride = {},
) {
	queriesRepository.findCommentsByPoemId.mockResolvedValue([
		{
			id: 1,
			userId: DEFAULT_PERFORMER_USER_ID,
			poemId: DEFAULT_POEM_ID,
			content: 'Comment 1',
			createdAt: new Date(),
			...overrides,
		},
	]);
}

function makeParams(
	overrides: Partial<GetPoemCommentsParams> = {},
): GetPoemCommentsParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		...overrides,
	};
}

function makeGetPoemCommentsScenario() {
	const { sut: getPoemComments, mocks } = interactionsTestModule.makeSut(getPoemCommentsFactory);


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

		withExistingComments(overrides: FindCommentsOverride = {}) {
			givenExistingComments(mocks.queriesRepository, overrides);
			return this;
		},

		execute(params = makeParams()) {
			return getPoemComments(params);
		},

		get mocks() {
			return mocks;
		},
	};
}

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe.concurrent('USE-CASE - Interactions - GetPoemComments', () => {
	describe('Successful execution', () => {
		it('should list comments for public poem', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areBlocked: false })
				.withExistingComments();

			const result = await scenario.execute();

			expect(result).toHaveLength(1);
		});

		it('should allow friend to list comments for friends-only poem', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withExistingComments();

			const result = await scenario.execute();

			expect(result).toHaveLength(1);
		});

		it('should allow author to list comments even if not friends', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1, visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withExistingComments();

			const result = await scenario.execute();

			expect(result).toHaveLength(1);
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeGetPoemCommentsScenario().withUser({
				exists: false,
			});

			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeGetPoemCommentsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areBlocked: true });

			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ exists: false });

			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ visibility: 'private' });

			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError for unapproved poems', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });

			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError for draft poems', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ status: 'draft' });

			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError when comments are disabled', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ isCommentable: false });

			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poem when not friends', async () => {
			const scenario = makeGetPoemCommentsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false });

			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeGetPoemCommentsScenario().withUser().withPoem();

			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.execute(), Error);
		});
	});
});
