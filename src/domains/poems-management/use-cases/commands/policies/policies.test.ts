/* import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { canCreatePoem, canUpdatePoem } from './policies';

import {
	InvalidDedicatedUsersError,
	PoemCreationDeniedError,
	PoemNotFoundError,
	PoemUpdateDeniedError,
} from '../Errors';

import type { UserRole, UserStatus } from '@SharedKernel/Enums';

describe('POLICY - Poem Creation & Update', () => {
	let usersContract: any;
	let queriesRepository: any;

	const baseAuthor = {
		id: 1,
		status: 'active' as UserStatus,
		role: 'user' as UserRole,
	};

	beforeEach(() => {
		usersContract = {
			getUserBasicInfo: mock(),
		};

		queriesRepository = {
			selectPoemById: mock(),
		};
	});

	// ======================================================
	// CREATE
	// ======================================================

	describe('canCreatePoem', () => {
		it('Does not allow creation if author is not active', async () => {
			await expect(
				canCreatePoem({
					ctx: {
						author: { ...baseAuthor, status: 'banned' },
					},
					usersContract,
				}),
			).rejects.toBeInstanceOf(PoemCreationDeniedError);
		});

		it('Does not allow dedicate poem to inactive users', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				id: 2,
				status: 'banned',
			});

			await expect(
				canCreatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					toUserIds: [2],
				}),
			).rejects.toBeInstanceOf(InvalidDedicatedUsersError);
		});

		it('Allows creation when author is active and no dedicated users', async () => {
			await expect(
				canCreatePoem({
					ctx: { author: baseAuthor },
					usersContract,
				}),
			).resolves.toBeUndefined();
		});

		it('Allows creation when all dedicated users are active', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				id: 2,
				status: 'active',
			});

			await expect(
				canCreatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					toUserIds: [2],
				}),
			).resolves.toBeUndefined();

			expect(usersContract.getUserBasicInfo).toHaveBeenCalledWith(2);
		});
	});

	// ======================================================
	// UPDATE
	// ======================================================

	describe('canUpdatePoem', () => {
		it('Does not allow update if author is not active', async () => {
			await expect(
				canUpdatePoem({
					ctx: {
						author: { ...baseAuthor, status: 'banned' },
					},
					usersContract,
					queriesRepository,
					poemId: 10,
				}),
			).rejects.toBeInstanceOf(PoemUpdateDeniedError);
		});

		it('Does not allow update if poem does not exist', async () => {
			queriesRepository.selectPoemById.mockResolvedValue(null);

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
				}),
			).rejects.toBeInstanceOf(PoemNotFoundError);
		});

		it('Does not allow update if user is not the author', async () => {
			queriesRepository.selectPoemById.mockResolvedValue({
				id: 10,
				author: { id: 99 },
				status: 'draft',
				moderationStatus: 'approved',
			});

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
				}),
			).rejects.toBeInstanceOf(PoemUpdateDeniedError);
		});

		it('Does not allow update if poem is published', async () => {
			queriesRepository.selectPoemById.mockResolvedValue({
				id: 10,
				author: { id: 1 },
				status: 'published',
				moderationStatus: 'approved',
			});

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
				}),
			).rejects.toBeInstanceOf(PoemUpdateDeniedError);
		});

		it('Does not allow update if poem is removed by moderation', async () => {
			queriesRepository.selectPoemById.mockResolvedValue({
				id: 10,
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'removed',
			});

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
				}),
			).rejects.toBeInstanceOf(PoemUpdateDeniedError);
		});

		it('Does not allow dedicate poem to inactive users', async () => {
			queriesRepository.selectPoemById.mockResolvedValue({
				id: 10,
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'approved',
			});

			usersContract.getUserBasicInfo.mockResolvedValue({
				id: 2,
				status: 'banned',
			});

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
					toUserIds: [2],
				}),
			).rejects.toBeInstanceOf(InvalidDedicatedUsersError);
		});

		it('Allows update when everything is valid', async () => {
			const poem = {
				id: 10,
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'approved',
			};

			queriesRepository.selectPoemById.mockResolvedValue(poem);

			usersContract.getUserBasicInfo.mockResolvedValue({
				id: 2,
				status: 'active',
			});

			await expect(
				canUpdatePoem({
					ctx: { author: baseAuthor },
					usersContract,
					queriesRepository,
					poemId: 10,
					toUserIds: [2],
				}),
			).resolves.toBeUndefined();

			expect(queriesRepository.selectPoemById).toHaveBeenCalledWith(10);
			expect(usersContract.getUserBasicInfo).toHaveBeenCalledWith(2);
		});
	});
});
 */
