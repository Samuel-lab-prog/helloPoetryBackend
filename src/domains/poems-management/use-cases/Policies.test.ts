import { describe, it, expect, mock } from 'bun:test';

import {
	validateDedicatedUsers,
	canCreatePoem,
	canUpdatePoem,
	canViewPoem,
} from './Policies';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { QueriesRepository } from '../ports/Queries';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

describe('POLICY - Poems Management', () => {
	describe('validateDedicatedUsers', () => {
		it('Returns true when no user ids are provided', async () => {
			const usersContract = {} as UsersPublicContract;

			const result = await validateDedicatedUsers(usersContract, 1);

			expect(result).toBe(true);
		});

		it('Throws when author tries to dedicate poem to themselves', async () => {
			const usersContract = {} as UsersPublicContract;

			await expect(
				validateDedicatedUsers(usersContract, 1, [1]),
			).rejects.toThrow(ForbiddenError);
		});

		it('Returns false when any dedicated user is inactive or missing', async () => {
			const usersContract: UsersPublicContract = {
				selectUserBasicInfo: mock().mockResolvedValueOnce({
					id: 2,
					status: 'banned',
				}),
			} as any;

			const result = await validateDedicatedUsers(usersContract, 1, [2]);

			expect(result).toBe(false);
		});
	});

	describe('canCreatePoem', () => {
		it('Denies creation when author is not active', () => {
			expect(
				canCreatePoem({
					ctx: {
						author: { id: 1, status: 'banned', role: 'author' },
					},
					usersContract: {} as UsersPublicContract,
				}),
			).rejects.toThrow(ForbiddenError);
		});

		it('Denies creation when dedicated users are invalid', () => {
			const usersContract: UsersPublicContract = {
				selectUserBasicInfo: mock().mockResolvedValue({
					exists: true,
					id: 2,
					status: 'banned',
					role: 'author',
				}),
			} as any;

			expect(
				canCreatePoem({
					ctx: {
						author: { id: 1, status: 'active', role: 'author' },
					},
					usersContract,
					toUserIds: [2],
				}),
			).rejects.toThrow(UnprocessableEntityError);
		});
	});

	describe('canUpdatePoem', () => {
		const selectPoemById = mock();

		const queriesRepository: QueriesRepository = {
			selectPoemById,
			selectAuthorPoems: mock(),
			selectMyPoems: mock(),
		};

		it('Denies update when poem does not exist', async () => {
			selectPoemById.mockResolvedValueOnce(null);

			await expect(
				canUpdatePoem({
					poemId: 1,
					ctx: {
						author: { id: 1, status: 'active', role: 'author' },
					},
					usersContract: {} as UsersPublicContract,
					queriesRepository,
				}),
			).rejects.toThrow(NotFoundError);
		});

		it('Denies update when poem is published', async () => {
			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'published',
				moderationStatus: 'approved',
				author: { id: 1 },
			});

			await expect(
				canUpdatePoem({
					poemId: 1,
					ctx: {
						author: { id: 1, status: 'active', role: 'author' },
					},
					usersContract: {} as UsersPublicContract,
					queriesRepository,
				}),
			).rejects.toThrow(ForbiddenError);
		});
	});

	describe('canViewPoem', () => {
		it('Allows author to always view their poem', () => {
			const result = canViewPoem({
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

		it('Denies access to banned viewers', () => {
			const result = canViewPoem({
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

		it('Allows public poems for anonymous viewers', () => {
			const result = canViewPoem({
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
	});
});
