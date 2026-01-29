import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';
import { commandsRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

beforeEach(async () => {
	await clearDatabase();
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe('commandsRepository (Prisma) - insertPoem', () => {
	const USERS = [
		{
			id: 1,
			nickname: 'author1',
			email: 'a1@test.com',
			name: 'Author 1',
			passwordHash: 'hash',
			bio: '',
			avatarUrl: '',
		},
		{
			id: 2,
			nickname: 'author2',
			email: 'a2@test.com',
			name: 'Author 2',
			passwordHash: 'hash',
			bio: '',
			avatarUrl: '',
		},
	];

	beforeEach(async () => {
		await prisma.user.createMany({ data: USERS });
	});

	it('should insert a poem without tags', async () => {
		const poemData = {
			title: 'My First Poem',
			content: 'Hello world',
			slug: 'my-first-poem',
			excerpt: 'Hello world',
			authorId: 1,
		};

		const result = await commandsRepository.insertPoem(poemData);
		expect(result).toHaveProperty('id');

		const dbPoem = await prisma.poem.findUnique({ where: { id: result.id } });
		expect(dbPoem).toMatchObject({
			title: poemData.title,
			content: poemData.content,
			slug: poemData.slug,
			excerpt: poemData.excerpt,
			authorId: poemData.authorId,
			isCommentable: true,
		});
	});

	it('should insert a poem with tags', async () => {
		const poemData = {
			title: 'Poem With Tags',
			content: 'Tagged content',
			slug: 'poem-with-tags',
			excerpt: 'Tagged content',
			authorId: 2,
			tags: ['fun', 'life'],
		};

		const result = await commandsRepository.insertPoem(poemData);
		expect(result).toHaveProperty('id');

		const dbPoem = await prisma.poem.findUnique({
			where: { id: result.id },
			include: { tags: true },
		});

		expect(dbPoem?.tags.map((t) => t.name)).toEqual(
			expect.arrayContaining(['fun', 'life']),
		);
	});

	it('should handle optional fields (toUserId, toPoemId, isCommentable)', async () => {
		const poemData = {
			title: 'Optional Fields Poem',
			content: 'Optional content',
			slug: 'optional-fields',
			excerpt: 'Optional content',
			authorId: 1,
			toUserId: 2,
			toPoemId: undefined,
			isCommentable: false,
		};

		const result = await commandsRepository.insertPoem(poemData);
		const dbPoem = await prisma.poem.findUnique({ where: { id: result.id } });
		expect(dbPoem).toMatchObject({
			toUserId: 2,
			toPoemId: null,
			isCommentable: false,
		});
	});
});
