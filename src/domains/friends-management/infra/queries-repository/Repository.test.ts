import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';

import { queriesRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

describe('QueriesRepository (Prisma)', () => {
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

	describe('findFriendshipBetweenUsers', () => {
		it('returns friendship when exists regardless of order', async () => {
			const users = await prisma.user.findMany();

			await prisma.friendship.create({
				data: {
					userAId: Math.min(users[0]!.id, users[1]!.id),
					userBId: Math.max(users[0]!.id, users[1]!.id),
				},
			});

			const result = await queriesRepository.findFriendshipBetweenUsers({
				user1Id: users[1]!.id,
				user2Id: users[0]!.id,
			});

			expect(result).toMatchObject({
				userAId: Math.min(users[0]!.id, users[1]!.id),
				userBId: Math.max(users[0]!.id, users[1]!.id),
			});
		});

		it('returns null when friendship does not exist', async () => {
			const users = await prisma.user.findMany();

			const result = await queriesRepository.findFriendshipBetweenUsers({
				user1Id: users[0]!.id,
				user2Id: users[1]!.id,
			});

			expect(result).toBe(null);
		});
	});

	describe('findFriendRequest', () => {
		it('returns friend request when exists', async () => {
			const users = await prisma.user.findMany();

			await prisma.friendshipRequest.create({
				data: {
					requesterId: users[0]!.id,
					addresseeId: users[1]!.id,
				},
			});

			const result = await queriesRepository.findFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(result).toMatchObject({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});
		});

		it('returns null when friend request does not exist', async () => {
			const users = await prisma.user.findMany();

			const result = await queriesRepository.findFriendRequest({
				requesterId: users[0]!.id,
				addresseeId: users[1]!.id,
			});

			expect(result).toBe(null);
		});
	});

	describe('findBlockedRelationship', () => {
		it('returns block when user1 blocked user2', async () => {
			const users = await prisma.user.findMany();

			await prisma.blockedUser.create({
				data: {
					blockerId: users[0]!.id,
					blockedId: users[1]!.id,
				},
			});

			const result = await queriesRepository.findBlockedRelationship({
				userId1: users[0]!.id,
				userId2: users[1]!.id,
			});

			expect(result).toMatchObject({
				blockerId: users[0]!.id,
				blockedId: users[1]!.id,
			});
		});

		it('returns block when user2 blocked user1', async () => {
			const users = await prisma.user.findMany();

			await prisma.blockedUser.create({
				data: {
					blockerId: users[1]!.id,
					blockedId: users[0]!.id,
				},
			});

			const result = await queriesRepository.findBlockedRelationship({
				userId1: users[0]!.id,
				userId2: users[1]!.id,
			});

			expect(result).toMatchObject({
				blockerId: users[1]!.id,
				blockedId: users[0]!.id,
			});
		});

		it('returns null when no block exists', async () => {
			const users = await prisma.user.findMany();

			const result = await queriesRepository.findBlockedRelationship({
				userId1: users[0]!.id,
				userId2: users[1]!.id,
			});

			expect(result).toBe(null);
		});
	});
});
