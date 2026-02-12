import { describe, it, expect } from 'bun:test';
import { ForbiddenError, NotFoundError, ConflictError } from '@DomainError';
import { likePoemFactory } from './execute';
import {
	givenPoem,
	givenUser,
	givenUsersRelation,
	makeInteractionsSutWithConfig,
	type UserBasicInfoOverride,
	type PoemInteractionInfoOverride,
	type UsersRelationInfoOverride,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
	type InteractionsSutMocks,
} from '../../TestHelpers';
import type {
	LikePoemParams,
	CommandsRepository,
} from '../../../ports/Commands';
import { expectError } from '@TestUtils';

function makeLikePoemParams(
	overrides: Partial<LikePoemParams> = {},
): LikePoemParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		...overrides,
	};
}

export type CreatePoemLikeOverride = Partial<
	Awaited<ReturnType<CommandsRepository['createPoemLike']>>
>;

function givenPoemLikeExists(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	exists: boolean,
) {
	queriesRepository.existsPoemLike.mockResolvedValue(exists);
}

function givenPoemLikeCreated(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
	overrides: CreatePoemLikeOverride = {},
) {
	commandsRepository.createPoemLike.mockResolvedValue({
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		...overrides,
	});
}

function makeLikePoemScenario() {
	const { sut: likePoem, mocks } = makeInteractionsSutWithConfig(
		likePoemFactory,
		{
			includeCommands: true,
			includePoems: true,
			includeUsers: true,
			includeFriends: true,
			includeQueries: true,
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
		withAlreadyLikedPoem(result: boolean = true) {
			givenPoemLikeExists(mocks.queriesRepository, result);
			return this;
		},
		withPoemLikeCreated(overrides: CreatePoemLikeOverride = {}) {
			givenPoemLikeCreated(mocks.commandsRepository, overrides);
			return this;
		},
		withUsersRelation(overrides: UsersRelationInfoOverride = {}) {
			givenUsersRelation(mocks.friendsContract, overrides);
			return this;
		},
		execute(params = makeLikePoemParams()) {
			return likePoem(params);
		},
		get mocks() {
			return mocks;
		},
	};
}

describe.concurrent('USE-CASE - Interactions - LikePoem', () => {
	describe('Successful execution', () => {
		it('should like a public poem', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'public' })
				.withAlreadyLikedPoem(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.execute();
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('poemId');
		});

		it('should like an unlisted poem', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'unlisted' })
				.withAlreadyLikedPoem(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.execute();
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('poemId');
		});

		it('should like a friends-only poem when users are friends', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withAlreadyLikedPoem(false)
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.execute();
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('poemId');
		});

		it('should allow the author to like their own friends-only poem', async () => {
			const scenario = makeLikePoemScenario()
				.withUser({ id: 1 })
				.withPoem({ visibility: 'friends', authorId: 1 })
				.withAlreadyLikedPoem(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.execute();
			expect(result).toHaveProperty('userId', 1);
			expect(result).toHaveProperty('poemId');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeLikePoemScenario().withUser({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});
		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeLikePoemScenario().withUser({ status: 'suspended' });
			await expectError(scenario.execute(), ForbiddenError);
		});
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeLikePoemScenario().withUser({ status: 'banned' });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError for private poems if user is not author', async () => {
			const scenario = makeLikePoemScenario()
				.withUser({ id: 2 })
				.withPoem({ visibility: 'private', authorId: 1 });
			await expectError(scenario.execute(), ForbiddenError);
		});

	});

	describe('Relation rules', () => {
		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areBlocked: true, areFriends: false });
			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'friends'})
				.withUsersRelation({ areFriends: false, areBlocked: false });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Already liked', () => {
		it('should throw ConflictError when poem is already liked', async () => {
			const scenario = makeLikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'public' })
				.withAlreadyLikedPoem()
				.withUsersRelation({ areFriends: false, areBlocked: false });
			await expectError(scenario.execute(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeLikePoemScenario().withUser().withPoem();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.execute(), Error);
		});
	});
});
