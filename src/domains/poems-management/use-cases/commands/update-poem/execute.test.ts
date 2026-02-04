import { describe, it, expect, beforeEach, mock } from 'bun:test';

mock.module('../policies/policies', () => ({
	canUpdatePoem: mock(),
}));

import { canUpdatePoem } from '../policies/policies';
import { updatePoemFactory } from './execute';
import { PoemAlreadyExistsError } from '../Errors';

describe('USE-CASE - Update Poem', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let usersContract: any;
	let slugService: any;
	let updatePoem: any;

	beforeEach(() => {
		commandsRepository = {
			updatePoem: mock(),
		};

		queriesRepository = {};

		usersContract = {};

		slugService = {
			generateSlug: mock(),
		};

		updatePoem = updatePoemFactory({
			commandsRepository,
			queriesRepository,
			usersContract,
			slugService,
		});
	});

	it('Calls canUpdatePoem policy with correct params', async () => {
		(canUpdatePoem as any).mockResolvedValue(undefined);
		slugService.generateSlug.mockReturnValue('slug-test');
		commandsRepository.updatePoem.mockResolvedValue({
			ok: true,
			data: { id: 1 },
		});

		await updatePoem({
			poemId: 10,
			data: { title: 'Hello', content: 'World' },
			meta: {
				requesterId: 5,
				requesterStatus: 'active',
				requesterRole: 'user',
			},
		});

		expect(canUpdatePoem).toHaveBeenCalledWith({
			ctx: {
				author: {
					id: 5,
					status: 'active',
					role: 'user',
				},
			},
			usersContract,
			toUserIds: [],
			poemId: 10,
			queriesRepository,
		});
	});

	it('Returns updated poem when update succeeds', async () => {
		const updatedPoem = { id: 10 };

		(canUpdatePoem as any).mockResolvedValue(undefined);
		slugService.generateSlug.mockReturnValue('slug-test');
		commandsRepository.updatePoem.mockResolvedValue({
			ok: true,
			data: updatedPoem,
		});

		const result = await updatePoem({
			poemId: 10,
			data: { title: 'Hello', content: 'World' },
			meta: {
				requesterId: 5,
				requesterStatus: 'active',
				requesterRole: 'user',
			},
		});

		expect(result).toEqual(updatedPoem);

		expect(commandsRepository.updatePoem).toHaveBeenCalledWith(10, {
			title: 'Hello',
			content: 'World',
			slug: 'slug-test',
		});
	});

	it('Throws PoemAlreadyExistsError when repository returns CONFLICT', () => {
		(canUpdatePoem as any).mockResolvedValue(undefined);
		slugService.generateSlug.mockReturnValue('slug-test');

		commandsRepository.updatePoem.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
		});

		expect(
			updatePoem({
				poemId: 10,
				data: { title: 'Hello', content: 'World' },
				meta: {
					requesterId: 5,
					requesterStatus: 'active',
					requesterRole: 'user',
				},
			}),
		).rejects.toBeInstanceOf(PoemAlreadyExistsError);
	});

	it('Throws unexpected error from repository', () => {
		const error = new Error('db exploded');

		(canUpdatePoem as any).mockResolvedValue(undefined);
		slugService.generateSlug.mockReturnValue('slug-test');

		commandsRepository.updatePoem.mockResolvedValue({
			ok: false,
			error,
		});

		expect(
			updatePoem({
				poemId: 10,
				data: { title: 'Hello', content: 'World' },
				meta: {
					requesterId: 5,
					requesterStatus: 'active',
					requesterRole: 'user',
				},
			}),
		).rejects.toBe(error);
	});
});
