import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';
import { queriesRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('REPOSITORY - Poems Management', () => {
	const USERS = [
		{
			id: 1,
			nickname: 'alice',
			email: 'alice@test.com',
			name: 'Alice',
			passwordHash: 'hash',
			bio: '',
			avatarUrl: '',
		},
		{
			id: 2,
			nickname: 'bob',
			email: 'bob@test.com',
			name: 'Bob',
			passwordHash: 'hash',
			bio: '',
			avatarUrl: '',
		},
		{
			id: 3,
			nickname: 'charlie',
			email: 'charlie@test.com',
			name: 'Charlie',
			passwordHash: 'hash',
			bio: '',
			avatarUrl: '',
		},
	];

	beforeAll(async () => {
		await clearDatabase();
		await prisma.user.createMany({ data: USERS });

		await prisma.friendship.createMany({
			data: [
				{ userAId: 1, userBId: 2 },
				{ userAId: 2, userBId: 3 },
			],
		});

		await prisma.poem.createMany({
			data: [
				{
					id: 1,
					title: 'Poem 1',
					content: 'Hello',
					slug: 'poem-1',
					excerpt: 'Hello',
					authorId: 1,
				},
				{
					id: 2,
					title: 'Poem 2',
					content: 'World',
					slug: 'poem-2',
					excerpt: 'World',
					authorId: 1,
				},
				{
					id: 3,
					title: 'Poem 3',
					content: 'Foo',
					slug: 'poem-3',
					excerpt: 'Foo',
					authorId: 2,
				},
			],
		});
	});

	afterAll(async () => {
		await clearDatabase();
	});

	it('selectMyPoems returns all poems authored by requester with proper stats', async () => {
		const poems = await queriesRepository.selectMyPoems({ requesterId: 1 });
		expect(poems.length).toBe(2);

		poems.forEach((p) => {
			expect(typeof p.id).toBe('number');
			expect(typeof p.title).toBe('string');
			expect(typeof p.content).toBe('string');
			expect(p.stats).toHaveProperty('likesCount');
			expect(p.stats).toHaveProperty('commentsCount');
		});
	});

	it('selectAuthorPoems returns all poems with author info including friendsIds and stats', async () => {
		const poems = await queriesRepository.selectAuthorPoems({ authorId: 1 });
		expect(poems.length).toBe(2);

		poems.forEach((p) => {
			expect(p.author.id).toBe(1);
			expect(Array.isArray(p.author.friendsIds)).toBe(true);
			expect(p.stats).toHaveProperty('likesCount');
			expect(p.stats).toHaveProperty('commentsCount');
			expect(typeof p.title).toBe('string');
		});
	});

	it('selectPoemById returns full poem details including author, stats and dedications', async () => {
		const poem = await queriesRepository.selectPoemById({ poemId: 1 });
		expect(poem).not.toBeNull();
		expect(poem?.id).toBe(1);
		expect(poem?.title).toBe('Poem 1');
		expect(poem?.content).toBe('Hello');
		expect(poem?.slug).toBe('poem-1');

		expect(poem?.author).toHaveProperty('id', 1);
		expect(Array.isArray(poem?.author.friendsIds)).toBe(true);

		expect(poem?.stats).toHaveProperty('likesCount');
		expect(poem?.stats).toHaveProperty('commentsCount');

		expect(poem?.dedicatedToUser).toBeNull();
		expect(poem?.dedicatedToPoem).toBeNull();
	});

	it('selectPoemById returns null for non-existent poem', async () => {
		const poem = await queriesRepository.selectPoemById({ poemId: 999 });
		expect(poem).toBeNull();
	});
});
