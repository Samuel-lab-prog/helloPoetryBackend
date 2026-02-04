import { describe, it, expect, beforeEach, mock } from 'bun:test';

mock.module('../policies/policies', () => ({
	canViewPoem: mock(),
}));

import { canViewPoem } from '../policies/policies';
import { getAuthorPoemsFactory } from './execute';

describe('USE-CASE - Get Author Poems', () => {
	let poemQueriesRepository: any;
	let getAuthorPoems: any;

	beforeEach(() => {
		poemQueriesRepository = {
			selectAuthorPoems: mock(),
		};

		getAuthorPoems = getAuthorPoemsFactory({
			poemQueriesRepository,
		});
	});

	it('Calls selectAuthorPoems with authorId', async () => {
		poemQueriesRepository.selectAuthorPoems.mockResolvedValue([]);

		await getAuthorPoems({ authorId: 10 });

		expect(poemQueriesRepository.selectAuthorPoems).toHaveBeenCalledWith(10);
	});

	it('Calls canViewPoem for each poem with correct params', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [20] },
			},
		];

		poemQueriesRepository.selectAuthorPoems.mockResolvedValue(poems);
		(canViewPoem as any).mockReturnValue(true);

		await getAuthorPoems({
			authorId: 5,
			requesterId: 20,
			requesterRole: 'user',
			requesterStatus: 'active',
		});

		expect(canViewPoem).toHaveBeenCalledWith({
			author: {
				id: 5,
				friendIds: [20],
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

	it('Returns only poems allowed by canViewPoem', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [] },
			},
			{
				id: 2,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [] },
			},
		];

		poemQueriesRepository.selectAuthorPoems.mockResolvedValue(poems);

		(canViewPoem as any).mockReturnValueOnce(true).mockReturnValueOnce(false);

		const result = await getAuthorPoems({ authorId: 5 });

		expect(result).toEqual([poems[0]]);
	});

	it('Returns empty array when no poem is allowed', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'private',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [] },
			},
		];

		poemQueriesRepository.selectAuthorPoems.mockResolvedValue(poems);
		(canViewPoem as any).mockReturnValue(false);

		const result = await getAuthorPoems({ authorId: 5 });

		expect(result).toEqual([]);
	});

	it('Returns all poems when all are allowed', async () => {
		const poems = [
			{
				id: 1,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [] },
			},
			{
				id: 2,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'clean',
				author: { id: 5, friendIds: [] },
			},
		];

		poemQueriesRepository.selectAuthorPoems.mockResolvedValue(poems);
		(canViewPoem as any).mockReturnValue(true);

		const result = await getAuthorPoems({ authorId: 5 });

		expect(result).toEqual(poems);
	});
});
