import { describe, it, expect, beforeEach } from 'bun:test';
import { prisma } from '@PrismaClient';
import { commandsRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('REPOSITORY - Poems Management', () => {
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
		await clearDatabase();
		await prisma.user.createMany({ data: USERS });
	});

	describe('insertPoem', () => {
		it('Should able to insert a poem without tags', async () => {
			const poemData = {
				title: 'My First Poem',
				content: 'Hello world',
				slug: 'my-first-poem',
				excerpt: 'Hello world',
				authorId: 1,
			};

			const result = await commandsRepository.insertPoem(poemData);
			expect(result).toHaveProperty('data');

			const dbPoem = await prisma.poem.findUnique({
				where: { id: result.data!.id },
			});
			expect(dbPoem).toMatchObject({
				title: poemData.title,
				content: poemData.content,
				slug: poemData.slug,
				excerpt: poemData.excerpt,
				authorId: poemData.authorId,
				isCommentable: true,
			});
		});

		it('Should able to insert a poem with tags', async () => {
			const poemData = {
				title: 'Poem With Tags',
				content: 'Tagged content',
				slug: 'poem-with-tags',
				excerpt: 'Tagged content',
				authorId: 2,
				tags: ['fun', 'life'],
			};

			const result = await commandsRepository.insertPoem(poemData);
			expect(result).toHaveProperty('data');

			const dbPoem = await prisma.poem.findUnique({
				where: { id: result.data!.id },
				include: { tags: true },
			});

			expect(dbPoem?.tags.map((t) => t.name)).toEqual(
				expect.arrayContaining(['fun', 'life']),
			);
		});

		it('Should handle conflicts on slug and authorId', async () => {
			const poemData = {
				title: 'Original Poem',
				content: 'Original content',
				slug: 'unique-slug',
				excerpt: 'Original content',
				authorId: 1,
			};
			await commandsRepository.insertPoem(poemData);

			const conflictingPoemData = {
				...poemData,
				title: 'Conflicting Poem',
				content: 'Conflicting content',
			};
			const result = await commandsRepository.insertPoem(conflictingPoemData);

			expect(result.ok).toBe(false);
			expect((result as any).code).toBe('CONFLICT');
		});
	});
});
