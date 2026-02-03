import { describe, it, expect, beforeEach } from 'bun:test';
import { prisma } from '@PrismaClient';
import { commandsRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import type { UpdatePoem } from '@Domains/poems-management/use-cases/commands/Models';

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

	describe('updatePoem', () => {
		it('Should update poem fields without tags', async () => {
			const poem = await commandsRepository.insertPoem({
				title: 'Original',
				content: 'Content',
				slug: 'original',
				excerpt: 'Excerpt',
				authorId: 1,
			});

			const updatedData: UpdatePoem & { slug: string } = {
				title: 'Updated Title',
				content: 'Updated Content',
				slug: 'updated-slug',
				excerpt: 'Updated Excerpt',
				isCommentable: false,
				visibility: 'public',
				status: 'draft',
				tags: [],
			};

			const result = await commandsRepository.updatePoem(
				poem.data!.id,
				updatedData,
			);
			expect(result).toMatchObject({
				data: {
					...updatedData,
				},
				ok: true,
			});

			const dbPoem = await prisma.poem.findUnique({
				where: { id: poem.data!.id },
				include: { tags: true },
			});
			expect(dbPoem?.tags).toHaveLength(0);
		});

		it('Should update poem with new tags', async () => {
			const poem = await commandsRepository.insertPoem({
				title: 'Original With Tags',
				content: 'Content',
				slug: 'original-tags',
				excerpt: 'Excerpt',
				authorId: 2,
			});

			const updatedData: UpdatePoem & { slug: string } = {
				title: 'Updated With Tags',
				content: 'Updated Content',
				slug: 'updated-tags',
				excerpt: 'Updated Excerpt',
				isCommentable: true,
				visibility: 'private',
				status: 'draft',
				tags: ['fun', 'life'],
			};

			const result = await commandsRepository.updatePoem(
				poem.data!.id,
				updatedData,
			);
			expect(result).toMatchObject({
				data: {
					...updatedData,
				},
				ok: true,
			});
			expect(result.data!.tags).toEqual(
				expect.arrayContaining(['fun', 'life']),
			);
		});

		it('Should replace old tags with new tags', async () => {
			const poem = await commandsRepository.insertPoem({
				title: 'Original',
				content: 'Content',
				slug: 'original',
				excerpt: 'Excerpt',
				authorId: 1,
				tags: ['old'],
			});

			const updatedData: UpdatePoem & { slug: string } = {
				title: 'Updated',
				content: 'Updated',
				slug: 'updated',
				excerpt: 'Updated',
				isCommentable: true,
				visibility: 'public',
				status: 'draft',
				tags: ['new1', 'new2'],
			};

			const result = await commandsRepository.updatePoem(
				poem.data!.id,
				updatedData,
			);
			expect(result).toMatchObject({
				data: {
					...updatedData,
				},
				ok: true,
			});
			expect(result.data!.tags).toEqual(
				expect.arrayContaining(['new1', 'new2']),
			);
		});

		it('Should handle conflicts on update slug', async () => {
			// Insert two poems
			await commandsRepository.insertPoem({
				title: 'Poem 1',
				content: 'Content 1',
				slug: 'slug1',
				excerpt: 'Excerpt 1',
				authorId: 1,
			});
			const poem2 = await commandsRepository.insertPoem({
				title: 'Poem 2',
				content: 'Content 2',
				slug: 'slug2',
				excerpt: 'Excerpt 2',
				authorId: 1,
			});

			const conflictingUpdate: UpdatePoem & { slug: string } = {
				title: 'Updated',
				content: 'Updated',
				slug: 'slug1', // same as poem1
				excerpt: 'Updated',
				isCommentable: true,
				visibility: 'public',
				status: 'draft',
				tags: [],
			};

			const result = await commandsRepository.updatePoem(
				poem2.data!.id,
				conflictingUpdate,
			);
			expect(result.ok).toBe(false);
			expect((result as any).code).toBe('CONFLICT');
		});
	});
});
