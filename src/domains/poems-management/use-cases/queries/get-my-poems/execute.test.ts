import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { getMyPoemsFactory } from './execute';
import { canViewPoem } from '../policies/policies';
import type { MyPoem } from '../read-models/MyPoem';

let poemQueriesRepository: any;
let getMyPoems: ReturnType<typeof getMyPoemsFactory>;

beforeEach(() => {
	poemQueriesRepository = {
		selectMyPoems: mock(),
	};

	getMyPoems = getMyPoemsFactory({ poemQueriesRepository });
});

describe('getMyPoems use case', () => {
	const requesterId = 1;
	const poems: MyPoem[] = [
		{
			id: 1,
			status: 'published',
			visibility: 'public',
			slug: 'poem-1',
			title: 'Poem 1',
			tags: [],
			moderationStatus: 'approved',
			createdAt: new Date(),
			updatedAt: new Date(),
			content: 'Content 1',
			isCommentable: true,
			excerpt: 'Excerpt 1',
			stats: { likesCount: 0, commentsCount: 0 },
		},
		{
			id: 2,
			status: 'draft',
			visibility: 'private',
			slug: 'poem-2',
			title: 'Poem 2',
			tags: [],
			moderationStatus: 'approved',
			createdAt: new Date(),
			updatedAt: new Date(),
			content: 'Content 2',
			isCommentable: true,
			excerpt: 'Excerpt 2',
			stats: { likesCount: 0, commentsCount: 0 },
		},
		{
			id: 3,
			status: 'published',
			visibility: 'private',
			slug: 'poem-3',
			title: 'Poem 3',
			tags: [],
			moderationStatus: 'approved',
			createdAt: new Date(),
			updatedAt: new Date(),
			content: 'Content 3',
			isCommentable: true,
			excerpt: 'Excerpt 3',
			stats: { likesCount: 0, commentsCount: 0 },
		},
	];

	it('should return only poems the requester can view', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue(poems);

		const result = await getMyPoems({ requesterId });

		// Manually filter expected using canViewPoem
		const expected = poems.filter((poem) =>
			canViewPoem({
				author: { id: requesterId },
				poem: { id: poem.id, status: poem.status, visibility: poem.visibility },
				viewer: { id: requesterId },
			}),
		);

		expect(result).toEqual(expected);
		expect(poemQueriesRepository.selectMyPoems).toHaveBeenCalledWith({
			requesterId,
		});
	});

	it('should return empty array if no poems exist', async () => {
		poemQueriesRepository.selectMyPoems.mockResolvedValue([]);

		const result = await getMyPoems({ requesterId });

		expect(result).toEqual([]);
	});

	it('should propagate errors from repository', async () => {
		poemQueriesRepository.selectMyPoems.mockRejectedValue(
			new Error('DB failure'),
		);

		await expect(getMyPoems({ requesterId })).rejects.toThrow('DB failure');
	});
});
