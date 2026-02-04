import { describe, it, expect, beforeEach, mock } from 'bun:test';

import { createPoemFactory } from './execute';

mock.module('../policies/policies', () => ({
	canCreatePoem: mock(),
}));

import { PoemAlreadyExistsError } from '../Errors';
import { canCreatePoem } from '../policies/policies';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

describe('USE CASE - Create Poem', () => {
	let commandsRepository: any;
	let slugService: any;
	let usersContract: any;

	const baseMeta = {
		requesterId: 1,
		requesterStatus: 'active' as UserStatus,
		requesterRole: 'user' as UserRole,
	};

	const baseData = {
		title: 'My Poem',
		content: 'Poem content',
		toUserIds: [2],
	};

	beforeEach(() => {
		commandsRepository = {
			insertPoem: mock(),
		};

		slugService = {
			generateSlug: mock(),
		};

		usersContract = {};
	});

	// ======================================================
	// ERRORS
	// ======================================================

	it('Propagates error if policy denies creation', () => {
		(canCreatePoem as any).mockRejectedValue(new Error('policy error'));

		const createPoem = createPoemFactory({
			commandsRepository,
			slugService,
			usersContract,
		});

		expect(
			createPoem({
				data: baseData,
				meta: baseMeta,
			}),
		).rejects.toThrow('policy error');
	});

	it('Throws PoemAlreadyExistsError when repository returns CONFLICT', () => {
		(canCreatePoem as any).mockResolvedValue(undefined);

		slugService.generateSlug.mockReturnValue('my-poem');

		commandsRepository.insertPoem.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
		});

		const createPoem = createPoemFactory({
			commandsRepository,
			slugService,
			usersContract,
		});

		expect(
			createPoem({
				data: baseData,
				meta: baseMeta,
			}),
		).rejects.toBeInstanceOf(PoemAlreadyExistsError);
	});

	it('Propagates unknown repository error', () => {
		(canCreatePoem as any).mockResolvedValue(undefined);

		const repoError = new Error('db exploded');

		slugService.generateSlug.mockReturnValue('my-poem');

		commandsRepository.insertPoem.mockResolvedValue({
			ok: false,
			error: repoError,
		});

		const createPoem = createPoemFactory({
			commandsRepository,
			slugService,
			usersContract,
		});

		expect(
			createPoem({
				data: baseData,
				meta: baseMeta,
			}),
		).rejects.toBe(repoError);
	});

	// ======================================================
	// SUCCESS
	// ======================================================

	it('Creates poem successfully', async () => {
		(canCreatePoem as any).mockResolvedValue(undefined);

		slugService.generateSlug.mockReturnValue('my-poem');

		commandsRepository.insertPoem.mockResolvedValue({
			ok: true,
			data: { id: 10 },
		});

		const createPoem = createPoemFactory({
			commandsRepository,
			slugService,
			usersContract,
		});

		const result = await createPoem({
			data: baseData,
			meta: baseMeta,
		});

		expect(result).toHaveProperty('id', 10);

		expect(canCreatePoem).toHaveBeenCalledWith({
			ctx: {
				author: {
					id: 1,
					status: 'active',
					role: 'user',
				},
			},
			usersContract,
			toUserIds: [2],
		});

		expect(slugService.generateSlug).toHaveBeenCalledWith('My Poem');

		expect(commandsRepository.insertPoem).toHaveBeenCalledWith({
			...baseData,
			slug: 'my-poem',
			authorId: 1,
		});
	});
});
