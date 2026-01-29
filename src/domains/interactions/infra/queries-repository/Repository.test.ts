import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';
import {
	selectCommentById,
	findCommentsByPoemId,
	existsPoemLike,
} from './Repository';

describe('QueriesRepository - Comments & Likes', () => {
	let user: any;
	let poem: any;

	beforeEach(async () => {
		await prisma.poemLike.deleteMany();
		await prisma.comment.deleteMany();
		await prisma.poem.deleteMany();
		await prisma.user.deleteMany();

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

	// -----------------------
	// selectCommentById
	// -----------------------

	it('returns comment when exists', async () => {
		const comment = await prisma.comment.create({
			data: {
				content: 'Hello',
				authorId: user.id,
				poemId: poem.id,
			},
		});

		const result = await selectCommentById({
			commentId: comment.id,
		});

		expect(result).toMatchObject({
			id: comment.id,
			content: 'Hello',
			userId: user.id,
			poemId: poem.id,
		});
	});

	it('returns null when comment does not exist', async () => {
		const result = await selectCommentById({
			commentId: 9999,
		});

		expect(result).toBe(null);
	});

	it('supports special characters', async () => {
		const comment = await prisma.comment.create({
			data: {
				content: 'Olá 🌟 漢字',
				authorId: user.id,
				poemId: poem.id,
			},
		});

		const result = await selectCommentById({
			commentId: comment.id,
		});

		expect(result?.content).toBe('Olá 🌟 漢字');
	});

	// -----------------------
	// findCommentsByPoemId
	// -----------------------

	it('returns comments ordered by createdAt desc', async () => {
		const first = await prisma.comment.create({
			data: {
				content: 'First',
				authorId: user.id,
				poemId: poem.id,
			},
		});

		const second = await prisma.comment.create({
			data: {
				content: 'Second',
				authorId: user.id,
				poemId: poem.id,
			},
		});

		const result = await findCommentsByPoemId({
			poemId: poem.id,
		});

		expect(result.length).toBe(2);
		expect(result[0]!.id).toBe(second.id);
		expect(result[1]!.id).toBe(first.id);
	});

	it('returns empty array when poem has no comments', async () => {
		const result = await findCommentsByPoemId({
			poemId: poem.id,
		});

		expect(result).toEqual([]);
	});

	// -----------------------
	// existsPoemLike
	// -----------------------

	it('returns true when like exists', async () => {
		await prisma.poemLike.create({
			data: {
				userId: user.id,
				poemId: poem.id,
			},
		});

		const result = await existsPoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		expect(result).toBe(true);
	});

	it('returns false when like does not exist', async () => {
		const result = await existsPoemLike({
			userId: user.id,
			poemId: poem.id,
		});

		expect(result).toBe(false);
	});
});
