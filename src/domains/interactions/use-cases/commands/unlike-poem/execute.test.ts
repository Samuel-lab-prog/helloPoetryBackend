import { describe, it, expect } from 'bun:test';
import { expectError } from '@TestUtils';
import type {
	UnlikePoemParams,
	CommandsRepository,
} from '../../../ports/Commands';
import { NotFoundError, ForbiddenError } from '@DomainError';
import { unlikePoemFactory } from './execute';
import {
	givenUser,
	givenPoem,
	makeInteractionsSutWithConfig,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
	type InteractionsSutMocks,
} from '../../TestHelpers';

export type DeletePoemLikeOverride = Partial<
	Awaited<ReturnType<CommandsRepository['deletePoemLike']>>
>;

function makeUnlikePoemParams(
	overrides: Partial<UnlikePoemParams> = {},
): UnlikePoemParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		...overrides,
	};
}

function givenPoemLikeExists(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	exists: boolean,
) {
	queriesRepository.findPoemLike.mockResolvedValue(
		exists
			? { userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID }
			: null,
	);
}

function givenPoemLikeDeleted(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
	overrides: DeletePoemLikeOverride = {},
) {
	commandsRepository.deletePoemLike.mockResolvedValue({
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		...overrides,
	});
}

function makeUnlikePoemScenario() {
	const { sut: unlikePoem, mocks } = makeInteractionsSutWithConfig(
		unlikePoemFactory,
		{
			includeCommands: true,
			includePoems: true,
			includeUsers: true,
		},
	);

	return {
		withUser(overrides = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},
		withPoem(overrides = {}) {
			givenPoem(mocks.poemsContract, overrides);
			return this;
		},
		withExistingLike(exists = true) {
			givenPoemLikeExists(mocks.queriesRepository, exists);
			return this;
		},
		withPoemLikeDeleted(overrides: DeletePoemLikeOverride = {}) {
			givenPoemLikeDeleted(mocks.commandsRepository, overrides);
			return this;
		},
		execute(params = makeUnlikePoemParams()) {
			return unlikePoem(params);
		},
		get mocks() {
			return mocks;
		},
	};
}

describe.concurrent('USE-CASE - Interactions - UnlikePoem', () => {
	describe('Successful execution', () => {
		it('should unlike an existing poem like', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem()
				.withExistingLike()
				.withPoemLikeDeleted();

			const result = await scenario.execute();
			expect(result).toHaveProperty('userId', DEFAULT_PERFORMER_USER_ID);
			expect(result).toHaveProperty('poemId', DEFAULT_POEM_ID);
		});

		it('should return custom deleted like when overrides are provided', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem()
				.withExistingLike()
				.withPoemLikeDeleted({ poemId: 999, userId: 888 });

			const result = await scenario.execute();
			expect(result.userId).toBe(888);
			expect(result.poemId).toBe(999);
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeUnlikePoemScenario().withUser({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError when user is inactive', async () => {
			const scenario = makeUnlikePoemScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeUnlikePoemScenario().withUser({ status: 'banned' });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.execute(), NotFoundError);
		});

		it('should throw ForbiddenError when poem is not approved', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });
			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is not published', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem({ status: 'draft' });
			await expectError(scenario.execute(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem has invalid visibility', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem({ visibility: 'private' });
			await expectError(scenario.execute(), ForbiddenError);
		});
	});

	describe('Like existence', () => {
		it('should throw NotFoundError when like does not exist', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser()
				.withPoem()
				.withExistingLike(false);
			await expectError(scenario.execute(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should propagate dependency errors', async () => {
			const scenario = makeUnlikePoemScenario().withUser().withPoem();
			scenario.mocks.usersContract.getUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.execute(), Error);
		});
	});

	describe('Parameter overrides', () => {
		it('should handle custom userId and poemId in params', async () => {
			const scenario = makeUnlikePoemScenario()
				.withUser({ id: 555 })
				.withPoem({ id: 777 })
				.withExistingLike()
				.withPoemLikeDeleted({ userId: 555, poemId: 777 });

			const result = await scenario.execute(
				makeUnlikePoemParams({ userId: 555, poemId: 777 }),
			);
			expect(result.userId).toBe(555);
			expect(result.poemId).toBe(777);
		});
	});
});
