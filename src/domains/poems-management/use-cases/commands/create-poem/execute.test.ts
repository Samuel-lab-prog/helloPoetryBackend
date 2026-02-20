import { describe, it, expect, mock } from 'bun:test';

import { createPoemFactory } from './execute';

import type { CommandsRepository } from '../../../ports/Commands';
import type { SlugService } from '../../../ports/ExternalServices';
import type { CreatePoem } from '../../Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { ConflictError } from '@DomainError';

describe('USE-CASE - Poems Management', () => {
	describe('Create Poem', () => {
		const insertPoem = mock();
		const generateSlug = mock();
		const selectUserBasicInfo = mock();

		const commandsRepository: CommandsRepository = {
			insertPoem,
			updatePoem: mock(),
		};

		const slugService: SlugService = {
			generateSlug,
		};

		const usersContract: UsersPublicContract = {
			selectUserBasicInfo,
			selectAuthUserByEmail: mock(),
		} as UsersPublicContract;

		const createPoem = createPoemFactory({
			commandsRepository,
			slugService,
			usersContract,
		});

		const baseData: CreatePoem = {
			title: 'My Poem',
			content: 'Some content',
			toUserIds: [],
		} as CreatePoem;

		const baseMeta = {
			requesterId: 1,
			requesterStatus: 'active',
			requesterRole: 'author',
		} as const;

		it('Generates a slug from the poem title', async () => {
			generateSlug.mockReturnValueOnce('my-poem');
			insertPoem.mockResolvedValueOnce({
				ok: true,
				data: { id: 1 },
			});

			await createPoem({
				data: baseData,
				meta: baseMeta,
			});

			expect(generateSlug).toHaveBeenCalledWith('My Poem');
		});

		it('Calls repository with transformed poem data', async () => {
			generateSlug.mockReturnValueOnce('my-poem');
			insertPoem.mockResolvedValueOnce({
				ok: true,
				data: { id: 1 },
			});

			await createPoem({
				data: baseData,
				meta: baseMeta,
			});

			expect(insertPoem).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'My Poem',
					content: 'Some content',
					slug: 'my-poem',
					authorId: 1,
				}),
			);
		});

		it('Returns created poem result on success', async () => {
			generateSlug.mockReturnValueOnce('my-poem');
			insertPoem.mockResolvedValueOnce({
				ok: true,
				data: { id: 42 },
			});

			const result = await createPoem({
				data: baseData,
				meta: baseMeta,
			});

			expect(result).toHaveProperty('id', 42);
		});

		it('Throws ConflictError on repository conflict', async () => {
			generateSlug.mockReturnValueOnce('my-poem');
			insertPoem.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
			});

			const promise = createPoem({
				data: baseData,
				meta: baseMeta,
			});

			await expect(promise).rejects.toThrow(ConflictError);
		});

		it('Propagates unknown repository errors', async () => {
			const infraError = new Error('unexpected infra failure');

			generateSlug.mockReturnValueOnce('my-poem');
			insertPoem.mockResolvedValueOnce({
				ok: false,
				error: infraError,
			});

			const promise = createPoem({
				data: baseData,
				meta: baseMeta,
			});

			await expect(promise).rejects.toThrow(infraError);
		});
	});
});
