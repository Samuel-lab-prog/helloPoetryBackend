import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';
import {
	createPoemLike,
	deletePoemLike,
	findPoemLike,
	createPoemComment,
	deletePoemComment,
} from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('CommandsRepository - Likes & Comments', () => {
	let user: any;
	let poem: any;

	beforeEach(async () => {
		await clearDatabase();
		user = await prisma.user.create({
			data: {
				nickname: 'user',
				email: 'user@test.com',
				name: 'User',
				passwordHash: 'hash',
				bio: 'sd',
				avatarUrl: 'sd',
			},
		});

		poem = await prisma.poem.create({
			data: {
				title: 'Poem',
				content: 'Content',
				authorId: user.id,
				slug: 'poem',
			},
		});
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('createPoemLike creates like', async () => {
		const like = await createPoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		expect(like).toMatchObject({
			userId: user.id,
			poemId: poem.id,
		});
	});

	it('findPoemLike returns like when exists', async () => {
		await prisma.poemLike.create({
			data: {
				userId: user.id,
				poemId: poem.id,
			},
		});

		const like = await findPoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		expect(like).toMatchObject({
			userId: user.id,
			poemId: poem.id,
		});
	});

	it('findPoemLike returns null when not exists', async () => {
		const like = await findPoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		expect(like).toBe(null);
	});

	it('deletePoemLike removes existing like', async () => {
		await prisma.poemLike.create({
			data: {
				userId: user.id,
				poemId: poem.id,
			},
		});

		await deletePoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		const found = await prisma.poemLike.findUnique({
			where: {
				userId_poemId: {
					userId: user.id,
					poemId: poem.id,
				},
			},
		});

		expect(found).toBe(null);
	});

	it('createPoemComment creates comment', async () => {
		const comment = await createPoemComment({
			userId: user.id,
			poemId: poem.id,
			content: 'Hello',
		});

		expect(comment).toMatchObject({
			content: 'Hello',
			userId: user.id,
			poemId: poem.id,
		});
	});

	it('createPoemComment supports special characters', async () => {
		const comment = await createPoemComment({
			userId: user.id,
			poemId: poem.id,
			content: 'Olá 🌟 漢字',
		});

		expect(comment.content).toBe('Olá 🌟 漢字');
	});

	it('deletePoemComment deletes comment', async () => {
		const dbComment = await prisma.comment.create({
			data: {
				content: 'Delete me',
				authorId: user.id,
				poemId: poem.id,
			},
		});

		await deletePoemComment({
			commentId: dbComment.id,
		});

		const found = await prisma.comment.findUnique({
			where: { id: dbComment.id },
		});

		expect(found).toBe(null);
	});
});
