import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { getMyPoemsFactory } from './execute';
import { canViewPoem } from '../policies/policies';

describe('USE-CASE - Get My Poems', () => {
	let poemQueriesRepository: any;
	let getMyPoems: any;

	const basePoems = [
		{
			id: 1,
			status: 'published',
			visibility: 'public',
			moderationStatus: 'approved',
		},
		{
			id: 2,
			status: 'draft',
			visibility: 'private',
			moderationStatus: 'approved',
		},
		{
			id: 3,
			status: 'published',
			visibility: 'friends',
			moderationStatus: 'approved',
		},
		{
			id: 4,
			status: 'published',
			visibility: 'unlisted',
			moderationStatus: 'approved',
		},
	];

	beforeEach(() => {
		poemQueriesRepository = {
			selectMyPoems: mock(),
		};

		getMyPoems = getMyPoemsFactory({
			poemQueriesRepository,
		});
	});

	it('Returns all poems authored by requester regardless of visibility', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue(basePoems);

		const poems = await getMyPoems({ requesterId: 1 });
		expect(poems.length).toBe(basePoems.length);
		expect(poems.map((p: any) => p.id)).toEqual([1, 2, 3, 4]);
	});

	it('Author can see even unapproved or draft poems', async () => {
		const poemsWithUnapproved = [
			...basePoems,
			{
				id: 5,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'pending',
			},
			{
				id: 6,
				status: 'draft',
				visibility: 'private',
				moderationStatus: 'pending',
			},
		];

		poemQueriesRepository.selectMyPoems.mockResolvedValue(poemsWithUnapproved);

		const poems = await getMyPoems({ requesterId: 1 });
		expect(poems.map((p: any) => p.id)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('Works with empty poem list', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue([]);

		const poems = await getMyPoems({ requesterId: 1 });
		expect(poems.length).toBe(0);
	});

	it('All returned poems pass canViewPoem check', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue(basePoems);

		const poems = await getMyPoems({ requesterId: 1 });
		for (const poem of poems) {
			const canView = canViewPoem({
				viewer: { id: 1 },
				author: { id: 1 },
				poem: {
					id: poem.id,
					status: poem.status,
					visibility: poem.visibility,
					moderationStatus: poem.moderationStatus,
				},
			});
			expect(canView).toBe(true);
		}
	});
});
