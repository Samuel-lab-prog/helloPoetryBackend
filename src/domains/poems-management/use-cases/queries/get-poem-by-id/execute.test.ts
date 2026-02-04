import { describe, it, expect, beforeEach, mock } from 'bun:test';

mock.module('../policies/policies', () => ({
	canViewPoem: mock(),
}));

import { canViewPoem } from '../policies/policies';
import { getPoemFactory } from './execute';
import { PoemNotFoundError, PoemAccessDeniedError } from '../Errors';

describe('USE-CASE - Get Poem', () => {
	let poemQueriesRepository: any;
	let getPoem: any;

	beforeEach(() => {
		poemQueriesRepository = {
			selectPoemById: mock(),
		};

		getPoem = getPoemFactory({
			poemQueriesRepository,
		});
	});

	it('Throws PoemNotFoundError if poem does not exist', () => {
		poemQueriesRepository.selectPoemById.mockResolvedValue(null);

		expect(getPoem({ poemId: 10 })).rejects.toBeInstanceOf(PoemNotFoundError);
	});

	it('Calls canViewPoem with correct params', async () => {
		const poem = {
			id: 1,
			status: 'draft',
			visibility: 'public',
			moderationStatus: 'clean',
			author: { id: 5, friendIds: [20] },
		};

		poemQueriesRepository.selectPoemById.mockResolvedValue(poem);
		(canViewPoem as any).mockReturnValue(true);

		await getPoem({
			poemId: 1,
			requesterId: 20,
			requesterRole: 'user',
			requesterStatus: 'active',
		});

		expect(canViewPoem).toHaveBeenCalledWith({
			author: {
				id: 5,
				friendIds: [20],
				directAccess: true,
			},
			poem: {
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
			},
			viewer: {
				id: 20,
				role: 'user',
				status: 'active',
			},
		});
	});

	it('Throws PoemAccessDeniedError if viewer cannot access poem', () => {
		const poem = {
			id: 1,
			status: 'draft',
			visibility: 'private',
			moderationStatus: 'clean',
			author: { id: 5, friendIds: [] },
		};

		poemQueriesRepository.selectPoemById.mockResolvedValue(poem);
		(canViewPoem as any).mockReturnValue(false);

		expect(getPoem({ poemId: 1, requesterId: 20 })).rejects.toBeInstanceOf(
			PoemAccessDeniedError,
		);
	});

	it('Returns poem when access is allowed', async () => {
		const poem = {
			id: 1,
			status: 'published',
			visibility: 'public',
			moderationStatus: 'clean',
			author: { id: 5, friendIds: [] },
		};

		poemQueriesRepository.selectPoemById.mockResolvedValue(poem);
		(canViewPoem as any).mockReturnValue(true);

		const result = await getPoem({ poemId: 1 });

		expect(result).toEqual(poem);
	});
});
