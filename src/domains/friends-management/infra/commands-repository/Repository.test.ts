import { describe, it, expect, beforeEach } from 'bun:test';
import { prisma } from '@PrismaClient';
import {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	cancelFriendRequest,
	blockUser,
	deleteFriend,
	unblockUser,
} from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('REPOSITORY - Friends Management', () => {
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

	// ---------------------------------------------------

	describe('createFriendRequest', () => {
		it('creates friend request and returns record', async () => {
			const [u1, u2] = await prisma.user.findMany();
			if (!u1 || !u2) throw new Error('Test users not found');

			const result = await createFriendRequest(u1.id, u2.id);

			expect(result.requesterId).toBe(u1.id);
			expect(result.addresseeId).toBe(u2.id);
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeInstanceOf(Date);

			const record = await prisma.friendshipRequest.findFirst();
			expect(record).not.toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('acceptFriendRequest', () => {
		it('deletes request and creates friendship', async () => {
			const [u1, u2] = await prisma.user.findMany();
			if (!u1 || !u2) throw new Error('Test users not found');

			await prisma.friendshipRequest.create({
				data: { requesterId: u1.id, addresseeId: u2.id },
			});

			const result = await acceptFriendRequest(u1.id, u2.id);

			expect(result.userAId).toBe(u1.id);
			expect(result.userBId).toBe(u2.id);

			const request = await prisma.friendshipRequest.findFirst();
			expect(request).toBeNull();

			const friendship = await prisma.friendship.findFirst();
			expect(friendship).not.toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('deleteFriend', () => {
		it('deletes friendship', async () => {
			const [u1, u2] = await prisma.user.findMany();

			if (!u1 || !u2) throw new Error('Test users not found');

			await prisma.friendship.create({
				data: { userAId: u1.id, userBId: u2.id },
			});

			const result = await deleteFriend(u1.id, u2.id);

			expect(result).toEqual({
				removedById: u1.id,
				removedId: u2.id,
			});

			const friendship = await prisma.friendship.findFirst();
			expect(friendship).toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('rejectFriendRequest', () => {
		it('deletes request and returns rejection record', async () => {
			const [u1, u2] = await prisma.user.findMany();

			if (!u1 || !u2) throw new Error('Test users not found');

			await prisma.friendshipRequest.create({
				data: { requesterId: u1.id, addresseeId: u2.id },
			});

			const result = await rejectFriendRequest(u1.id, u2.id);

			expect(result).toEqual({
				rejecterId: u1.id,
				rejectedId: u2.id,
			});

			const request = await prisma.friendshipRequest.findFirst();
			expect(request).toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('blockUser', () => {
		it('removes relations and creates block', async () => {
			const [u1, u2] = await prisma.user.findMany();
			if (!u1 || !u2) throw new Error('Test users not found');
			await prisma.friendshipRequest.create({
				data: { requesterId: u1.id, addresseeId: u2.id },
			});

			await prisma.friendship.create({
				data: { userAId: u1.id, userBId: u2.id },
			});

			const result = await blockUser(u1.id, u2.id);

			expect(result.blockedById).toBe(u1.id);
			expect(result.blockedUserId).toBe(u2.id);

			const request = await prisma.friendshipRequest.findFirst();
			const friendship = await prisma.friendship.findFirst();
			const block = await prisma.blockedUser.findFirst();

			expect(request).toBeNull();
			expect(friendship).toBeNull();
			expect(block).not.toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('unblockUser', () => {
		it('removes block', async () => {
			const [u1, u2] = await prisma.user.findMany();

			if (!u1 || !u2) throw new Error('Test users not found');

			await prisma.blockedUser.create({
				data: { blockerId: u1.id, blockedId: u2.id },
			});

			const result = await unblockUser(u1.id, u2.id);

			expect(result).toEqual({
				unblockerId: u1.id,
				unblockedId: u2.id,
			});

			const block = await prisma.blockedUser.findFirst();
			expect(block).toBeNull();
		});
	});

	// ---------------------------------------------------

	describe('cancelFriendRequest', () => {
		it('deletes request', async () => {
			const [u1, u2] = await prisma.user.findMany();

			if (!u1 || !u2) throw new Error('Test users not found');

			await prisma.friendshipRequest.create({
				data: { requesterId: u1.id, addresseeId: u2.id },
			});

			const result = await cancelFriendRequest(u1.id, u2.id);

			expect(result).toEqual({
				cancellerId: u1.id,
				cancelledId: u2.id,
			});

			const request = await prisma.friendshipRequest.findFirst();
			expect(request).toBeNull();
		});
	});
});
