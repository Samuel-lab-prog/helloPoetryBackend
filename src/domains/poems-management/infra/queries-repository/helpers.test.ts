import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { mapPoem } from './helpers';

type FindManyArgs = { where: Record<string, unknown>; [key: string]: unknown };
const findManyPoems = mock((_args: FindManyArgs) =>
	Promise.resolve([] as unknown[]),
);

mock.module('@Prisma/PrismaClient', () => ({
	prisma: { poem: { findMany: findManyPoems } },
}));

mock.module('@Prisma/PrismaErrorHandler', () => ({
	withPrismaErrorHandling: (callback: () => Promise<unknown>) => callback(),
}));

const { selectPoems } = await import('./repository');

describe('mapPoem', () => {
	it('maps dedications to users with friendIds and stats', () => {
		const poem = {
			id: 1,
			dedications: [
				{
					toUser: {
						id: 10,
						name: 'User A',
						nickname: 'usera',
						avatarUrl: null,
						friendshipsFrom: [{ userBId: 2 }],
						friendshipsTo: [{ userAId: 3 }],
					},
				},
			],
			_count: { poemLikes: 5, comments: 2 },
		};

		const mapped = mapPoem(poem);

		expect(mapped.toUsers).toHaveLength(1);
		expect(mapped.toUsers[0]).toHaveProperty('id', 10);
		expect(mapped.toUsers[0].friendIds).toEqual([2, 3]);
		expect(mapped.stats).toEqual({ likesCount: 5, commentsCount: 2 });
	});

	it('adds author friendIds when author is provided', () => {
		const poem = {
			id: 2,
			dedications: [],
			_count: { poemLikes: 0, comments: 0 },
		};
		const author = {
			id: 99,
			friendshipsFrom: [{ userBId: 7 }],
			friendshipsTo: [{ userAId: 8 }],
		};

		const mapped = mapPoem(poem, author);

		expect(mapped.author?.id).toBe(99);
		expect(mapped.author?.friendIds).toEqual([7, 8]);
	});
});

describe('selectPoems public search', () => {
	beforeEach(() => {
		findManyPoems.mockReset();
		findManyPoems.mockResolvedValue([]);
	});

	it('returns only published, approved, public poems from available authors', async () => {
		await selectPoems({
			navigationOptions: {},
			sortOptions: { orderBy: 'createdAt', orderDirection: 'desc' },
			filterOptions: {},
		});

		const where = findManyPoems.mock.calls[0]?.[0]?.where;
		expect(where).toMatchObject({
			deletedAt: null,
			status: 'published',
			visibility: 'public',
			moderationStatus: 'approved',
			author: { status: { not: 'banned' } },
		});
	});

	it('combines title search with a match on any selected tag', async () => {
		await selectPoems({
			navigationOptions: {},
			sortOptions: { orderBy: 'title', orderDirection: 'asc' },
			filterOptions: { searchTitle: 'river', tags: ['nature', 'water'] },
		});

		const where = findManyPoems.mock.calls[0]?.[0]?.where;
		expect(where).toMatchObject({
			title: { contains: 'river', mode: 'insensitive' },
			tags: { some: { name: { in: ['nature', 'water'] } } },
		});
	});
});
