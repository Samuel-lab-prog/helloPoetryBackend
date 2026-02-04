import { describe, it, expect, beforeEach, mock } from 'bun:test';

mock.module('../policies/policies', () => ({
	canViewPoem: mock(),
}));

import { canViewPoem } from '../policies/policies';
import { getMyPoemsFactory } from './execute';

describe('USE-CASE - Get My Poems', () => {
	let poemQueriesRepository: any;
	let getMyPoems: any;

	beforeEach(() => {
		poemQueriesRepository = {
			selectMyPoems: mock(),
		};

		getMyPoems = getMyPoemsFactory({
			poemQueriesRepository,
		});
	});

	it('Calls selectMyPoems with requesterId', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue([]);

		await getMyPoems({ requesterId: 10 });

		expect(poemQueriesRepository.selectMyPoems).toHaveBeenCalledWith(10);
	});

	it('Calls canViewPoem for each poem', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
			},
		];

		poemQueriesRepository.selectMyPoems.mockResolvedValue(poems);
		(canViewPoem as any).mockReturnValue(true);

		await getMyPoems({ requesterId: 10 });

		expect(canViewPoem).toHaveBeenCalledWith({
			author: { id: 10 },
			poem: {
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
			},
			viewer: { id: 10 },
		});
	});

	it('Returns only poems allowed by canViewPoem', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
			},
			{
				id: 2,
				status: 'draft',
				visibility: 'private',
				moderationStatus: 'clean',
			},
		];

		poemQueriesRepository.selectMyPoems.mockResolvedValue(poems);

		(canViewPoem as any).mockReturnValueOnce(true).mockReturnValueOnce(false);

		const result = await getMyPoems({ requesterId: 10 });

		expect(result).toEqual([poems[0]]);
	});

	it('Returns empty array if none are allowed', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'private',
				moderationStatus: 'clean',
			},
		];

		poemQueriesRepository.selectMyPoems.mockResolvedValue(poems);
		(canViewPoem as any).mockReturnValue(false);

		const result = await getMyPoems({ requesterId: 10 });

		expect(result).toEqual([]);
	});
});
