import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { getAuthorPoemsFactory } from './execute';
import { canViewPoem } from '../policies/policies';
import type { AuthorPoem } from '../models/AuthorPoem';

let poemQueriesRepository: any;
let getAuthorPoems: ReturnType<typeof getAuthorPoemsFactory>;

beforeEach(() => {
	poemQueriesRepository = {
		selectAuthorPoems: mock(),
	};

	getAuthorPoems = getAuthorPoemsFactory({ poemQueriesRepository });
});

describe('getAuthorPoems use case', () => {
	const poems: AuthorPoem[] = [
		{
			id: 1,
			title: 'Poem 1',
			content: 'Content 1',
			status: 'published' as const,
			visibility: 'public' as const,
			createdAt: new Date(),
			stats: { likesCount: 0, commentsCount: 0 },
			author: {
				id: 2,
				name: 'Author Name',
				nickname: 'author',
				avatarUrl: '',
				friendsIds: [3, 4],
			},
		},
		{
			id: 2,
			title: 'Poem 2',
			content: 'Content 2',
			status: 'draft' as const,
			visibility: 'private' as const,
			createdAt: new Date(),
			stats: { likesCount: 0, commentsCount: 0 },
			author: {
				id: 2,
				name: 'Author Name',
				nickname: 'author',
				avatarUrl: '',
				friendsIds: [3, 4],
			},
		},
		{
			id: 3,
			title: 'Poem 3',
			content: 'Content 3',
			status: 'published' as const,
			visibility: 'public' as const,
			createdAt: new Date(),
			stats: { likesCount: 0, commentsCount: 0 },
			author: {
				id: 2,
				name: 'Author Name',
				nickname: 'author',
				avatarUrl: '',
				friendsIds: [1, 5],
			},
		},
	];

	it('should return only poems the requester can view', async () => {
		poemQueriesRepository.selectAuthorPoems.mockResolvedValue(poems);

		const result = await getAuthorPoems({ requesterId: 1, authorId: 2 });

		// Use canViewPoem manually to filter expected
		const expected = poems.filter((poem) =>
			canViewPoem({
				author: { id: poem.author.id, friendIds: poem.author.friendsIds },
				poem: { id: poem.id, status: poem.status, visibility: poem.visibility },
				viewer: { id: 1 },
			}),
		);

		expect(result).toEqual(expected);
		expect(poemQueriesRepository.selectAuthorPoems).toHaveBeenCalledWith({
			authorId: 2,
		});
	});

	it('should return empty array if no poems exist', async () => {
		poemQueriesRepository.selectAuthorPoems.mockResolvedValue([]);

		const result = await getAuthorPoems({ requesterId: 1, authorId: 2 });

		expect(result).toEqual([]);
	});

	it('should propagate errors from repository', async () => {
		poemQueriesRepository.selectAuthorPoems.mockRejectedValue(
			new Error('DB failure'),
		);

		await expect(
			getAuthorPoems({ requesterId: 1, authorId: 2 }),
		).rejects.toThrow('DB failure');
	});
});
