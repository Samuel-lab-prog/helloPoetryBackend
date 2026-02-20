import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { expectError } from '@TestUtils';
import { validateDedicatedUsers } from './Policies';
import { makePoemsScenario } from './test-helpers/Helper';

describe.concurrent('POLICY - Poems Management', () => {
	describe('validateDedicatedUsers', () => {
		it('should return true when no user ids are provided', async () => {
			const scenario = makePoemsScenario().withUser();

			const result = await validateDedicatedUsers(
				scenario.mocks.usersContract,
				1,
			);

			expect(result).toBe(true);
		});

		it('should throw ForbiddenError when author tries to dedicate poem to themselves', async () => {
			const scenario = makePoemsScenario().withUser();

			await expectError(
				validateDedicatedUsers(scenario.mocks.usersContract, 1, [1]),
				ForbiddenError,
			);
		});

		it('should return false when dedicated user is inactive', async () => {
			const scenario = makePoemsScenario().withUser({ status: 'banned' });

			const result = await validateDedicatedUsers(
				scenario.mocks.usersContract,
				1,
				[2],
			);

			expect(result).toBe(false);
		});
	});

	describe('canCreatePoem', () => {
		it('should allow active author with valid dedicated users', async () => {
			const scenario = makePoemsScenario().withUser();

			await expect(
				scenario.executeCanCreatePoem({
					author: { id: 1, status: 'active' },
					toUserIds: [2],
				}),
			).resolves.toBeUndefined();
		});

		it('should throw UnprocessableEntityError when dedicated users are invalid', async () => {
			const scenario = makePoemsScenario().withUser({ status: 'suspended' });

			await expectError(
				scenario.executeCanCreatePoem({
					toUserIds: [2],
				}),
				UnprocessableEntityError,
			);
		});
	});

	describe('canUpdatePoem', () => {
		it('should allow update when author is active and poem is editable', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withPoem({
					id: 1,
					author: { id: 1 },
					status: 'draft',
					moderationStatus: 'approved',
				});

			await expect(scenario.executeCanUpdatePoem({ poemId: 1 })).resolves.toBe(
				undefined,
			);
		});

		it('should throw ForbiddenError when author is not active', async () => {
			const scenario = makePoemsScenario().withPoem();

			await expectError(
				scenario.executeCanUpdatePoem({
					author: { status: 'banned' },
				}),
				ForbiddenError,
			);
		});

		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makePoemsScenario().withPoemNotFound();

			await expectError(
				scenario.executeCanUpdatePoem({
					poemId: 1,
				}),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when requester is not the poem author', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 999 },
			});

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is published', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'published',
			});

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is removed', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'removed',
			});

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});
	});

	describe('canViewPoem', () => {
		it('should allow author to view their own poem', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 1 },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'draft',
					visibility: 'private',
					moderationStatus: 'removed',
				},
			});

			expect(result).toBe(true);
		});

		it('should deny banned viewer', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'banned' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(false);
		});

		it('should allow public approved published poems for anonymous viewer', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: {},
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(true);
		});

		it('should allow unlisted poem only with direct access', () => {
			const scenario = makePoemsScenario();

			const denied = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1, directAccess: false },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'unlisted',
					moderationStatus: 'approved',
				},
			});

			const allowed = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1, directAccess: true },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'unlisted',
					moderationStatus: 'approved',
				},
			});

			expect(denied).toBe(false);
			expect(allowed).toBe(true);
		});

		it('should allow friends-only poem only for friends', () => {
			const scenario = makePoemsScenario();

			const denied = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1, friendIds: [] },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'friends',
					moderationStatus: 'approved',
				},
			});

			const allowed = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1, friendIds: [2] },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'friends',
					moderationStatus: 'approved',
				},
			});

			expect(denied).toBe(false);
			expect(allowed).toBe(true);
		});

		it('should deny non-approved or draft poems for non-authors', () => {
			const scenario = makePoemsScenario();

			const rejected = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'rejected',
				},
			});

			const draft = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'active' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'draft',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(rejected).toBe(false);
			expect(draft).toBe(false);
		});

		it('should allow moderator to view non-private poem', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, role: 'moderator', status: 'active' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(true);
		});
	});
});
