import { describe, it, expect, mock } from 'bun:test';

import { updatePoemFactory } from './execute';
import { PoemAlreadyExistsError } from '../../Errors';

import type { CommandsRepository } from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { SlugService } from '../../../ports/ExternalServices';
import type { UpdatePoem } from '../../Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

describe('USE-CASE - Poems', () => {
	describe('Update Poem', () => {
		const updatePoemRepo = mock();
		const selectPoemById = mock();
		const generateSlug = mock();
		const selectUserBasicInfo = mock();

		const commandsRepository: CommandsRepository = {
			updatePoem: updatePoemRepo,
			insertPoem: mock(),
		};

		const queriesRepository: QueriesRepository = {
			selectPoemById,
			selectAuthorPoems: mock(),
			selectMyPoems: mock(),
		};

		const slugService: SlugService = {
			generateSlug,
		};

		const usersContract: UsersPublicContract = {
			selectUserBasicInfo,
			selectAuthUserByEmail: mock(),
		} as UsersPublicContract;

		const updatePoem = updatePoemFactory({
			commandsRepository,
			queriesRepository,
			usersContract,
			slugService,
		});

		const baseData: UpdatePoem = {
			title: 'Updated title',
			content: 'Updated content',
			toUserIds: [],
			excerpt: 'Updated excerpt',
			isCommentable: true,
			status: 'published',
			visibility: 'public',
			tags: ['tag1', 'tag2'],
		};

		const baseMeta = {
			requesterId: 1,
			requesterStatus: 'active',
			requesterRole: 'author',
		} as const;

		it('Generates a slug from the updated title', async () => {
			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'draft',
				moderationStatus: 'approved',
				author: { id: 1 },
			});
			generateSlug.mockReturnValueOnce('updated-title');
			updatePoemRepo.mockResolvedValueOnce({
				ok: true,
				data: { id: 1 },
			});

			await updatePoem({
				poemId: 1,
				data: baseData,
				meta: baseMeta,
			});

			expect(generateSlug).toHaveBeenCalledWith('Updated title');
		});

		it('Calls repository with transformed update data', async () => {
			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'draft',
				moderationStatus: 'approved',
				author: { id: 1 },
			});
			generateSlug.mockReturnValueOnce('updated-title');
			updatePoemRepo.mockResolvedValueOnce({
				ok: true,
				data: { id: 1 },
			});

			await updatePoem({
				poemId: 1,
				data: baseData,
				meta: baseMeta,
			});

			expect(updatePoemRepo).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					title: 'Updated title',
					content: 'Updated content',
					slug: 'updated-title',
				}),
			);
		});

		it('Returns updated poem result on success', async () => {
			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'draft',
				moderationStatus: 'approved',
				author: { id: 1 },
			});
			generateSlug.mockReturnValueOnce('updated-title');
			updatePoemRepo.mockResolvedValueOnce({
				ok: true,
				data: { id: 99 },
			});

			const result = await updatePoem({
				poemId: 1,
				data: baseData,
				meta: baseMeta,
			});

			expect(result).toHaveProperty('id', 99);
		});

		it('Throws PoemAlreadyExistsError on repository conflict', async () => {
			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'draft',
				moderationStatus: 'approved',
				author: { id: 1 },
			});
			generateSlug.mockReturnValueOnce('updated-title');
			updatePoemRepo.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
			});

			const promise = updatePoem({
				poemId: 1,
				data: baseData,
				meta: baseMeta,
			});

			await expect(promise).rejects.toThrow(PoemAlreadyExistsError);
		});

		it('Propagates unknown repository errors', async () => {
			const infraError = new Error('unexpected infra failure');

			selectPoemById.mockResolvedValueOnce({
				id: 1,
				status: 'draft',
				moderationStatus: 'approved',
				author: { id: 1 },
			});
			generateSlug.mockReturnValueOnce('updated-title');
			updatePoemRepo.mockResolvedValueOnce({
				ok: false,
				error: infraError,
			});

			const promise = updatePoem({
				poemId: 1,
				data: baseData,
				meta: baseMeta,
			});

			await expect(promise).rejects.toThrow(infraError);
		});
	});
});
