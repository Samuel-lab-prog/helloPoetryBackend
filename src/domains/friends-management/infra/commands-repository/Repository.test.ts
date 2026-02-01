import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';

import {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockFriendRequest,
	cancelFriendRequest,
} from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('CommandsRepository (Prisma)', () => {
	const USERS = [
		{
			nickname: 'user1',
			email: 'user1@test.com',
			name: 'User1',
			passwordHash: 'hash1',
			bio: 'Hello, I am User1',
			avatarUrl: 'http://example.com/avatar1.png',
		},
		{
			nickname: 'user2',
			email: 'user2@test.com',
			name: 'User2',
			passwordHash: 'hash2',
			bio: 'Hello, I am User2',
			avatarUrl: 'http://example.com/avatar2.png',
		},
		{
			nickname: 'user3',
			email: 'user3@test.com',
			name: 'User3',
			passwordHash: 'hash3',
			bio: 'Hello, I am User3',
			avatarUrl: 'http://example.com/avatar3.png',
		},
	];

	beforeEach(async () => {
		await clearDatabase();
		await prisma.user.createMany({ data: USERS });
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('createFriendRequest', () => {
		it('creates friend request and returns params', async () => {
			const users = await prisma.user.findMany();

			const result = await createFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			const record = await prisma.friendshipRequest.findFirst({
				where: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			expect(result).toEqual({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(record).toMatchObject({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});
		});
	});

	describe('acceptFriendRequest', () => {
		it('deletes request, creates friendship, and returns params', async () => {
			const users = await prisma.user.findMany();

			await prisma.friendshipRequest.create({
				data: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			const result = await acceptFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			const request = await prisma.friendshipRequest.findFirst({
				where: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			const friendship = await prisma.friendship.findFirst({
				where: {
					OR: [
						{ userAId: users[0]!.id, userBId: users[1]!.id },
						{ userAId: users[1]!.id, userBId: users[0]!.id },
					],
				},
			});

			expect(result).toEqual({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(request).toBe(null);
			expect(friendship).not.toBe(null);
		});
	});

	describe('rejectFriendRequest', () => {
		it('deletes friend request and returns params', async () => {
			const users = await prisma.user.findMany();

			await prisma.friendshipRequest.create({
				data: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			const result = await rejectFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			const request = await prisma.friendshipRequest.findFirst({
				where: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			expect(result).toEqual({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(request).toBe(null);
		});
	});

	describe('blockFriendRequest', () => {
		it('removes requests, removes friendships, creates block, and returns params', async () => {
			const users = await prisma.user.findMany();

			await prisma.friendshipRequest.create({
				data: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			await prisma.friendship.create({
				data: {
					userAId: users[0]!.id,
					userBId: users[1]!.id,
				},
			});

			const result = await blockFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			const request = await prisma.friendshipRequest.findFirst();
			const friendship = await prisma.friendship.findFirst();
			const block = await prisma.blockedFriend.findFirst({
				where: {
					blockerId: users[0]!.id,
					blockedId: users[1]!.id,
				},
			});

			expect(result).toEqual({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(request).toBe(null);
			expect(friendship).toBe(null);
			expect(block).toMatchObject({
				blockerId: users[0]!.id,
				blockedId: users[1]!.id,
			});
		});
	});

	describe('cancelFriendRequest', () => {
		it('deletes friend request and returns params', async () => {
			const users = await prisma.user.findMany();
			await prisma.friendshipRequest.create({
				data: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});
			const result = await cancelFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});
			const request = await prisma.friendshipRequest.findFirst({
				where: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});
			expect(result).toEqual({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});
			expect(request).toBe(null);
		});
	});
});
