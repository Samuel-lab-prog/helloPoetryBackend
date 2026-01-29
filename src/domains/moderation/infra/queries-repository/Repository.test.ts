import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { prisma } from '@PrismaClient';
import { queriesRepository } from './Repository';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

beforeEach(async () => {
	await clearDatabase();
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe('queriesRepository (Prisma) - selectActiveBanByUserId & selectActiveSuspensionByUserId', () => {
	const USERS = [
		{
			id: 1,
			nickname: 'mod',
			email: 'mod@example.com',
			name: 'Moderator',
			passwordHash: 'hash',
			bio: 'Moderator user',
			avatarUrl: 'abc',
		},
		{
			id: 2,
			nickname: 'target',
			email: 'target@example.com',
			name: 'Target',
			passwordHash: 'hash',
			bio: 'User to be sanctioned',
			avatarUrl: 'sdf',
		},
	];

	beforeEach(async () => {
		await prisma.user.createMany({ data: USERS });
	});

	it('selectActiveBanByUserId should return null if no active ban exists', async () => {
		const result = await queriesRepository.selectActiveBanByUserId({
			userId: 2,
		});
		expect(result).toBeNull();
	});

	it('selectActiveBanByUserId should return active ban if exists', async () => {
		const ban = await prisma.userSanction.create({
			data: { userId: 2, moderatorId: 1, reason: 'Test ban', type: 'ban' },
		});

		const result = await queriesRepository.selectActiveBanByUserId({
			userId: 2,
		});
		expect(result).toMatchObject({
			id: ban.id,
			userId: 2,
			moderatorId: 1,
			reason: 'Test ban',
			endAt: null,
		});
	});

	it('selectActiveSuspensionByUserId should return null if no active suspension exists', async () => {
		const result = await queriesRepository.selectActiveSuspensionByUserId({
			userId: 2,
		});
		expect(result).toBeNull();
	});

	it('selectActiveSuspensionByUserId should return active suspension if exists', async () => {
		const suspension = await prisma.userSanction.create({
			data: {
				userId: 2,
				moderatorId: 1,
				reason: 'Test suspension',
				type: 'suspension',
			},
		});

		const result = await queriesRepository.selectActiveSuspensionByUserId({
			userId: 2,
		});
		expect(result).toMatchObject({
			id: suspension.id,
			userId: 2,
			moderatorId: 1,
			reason: 'Test suspension',
		});
	});

	it('should ignore ended bans and suspensions', async () => {
		await prisma.userSanction.createMany({
			data: [
				{
					userId: 2,
					moderatorId: 1,
					reason: 'Ended ban',
					type: 'ban',
					endAt: new Date(),
				},
				{
					userId: 2,
					moderatorId: 1,
					reason: 'Ended suspension',
					type: 'suspension',
					endAt: new Date(),
				},
			],
		});

		const banResult = await queriesRepository.selectActiveBanByUserId({
			userId: 2,
		});
		const suspensionResult =
			await queriesRepository.selectActiveSuspensionByUserId({ userId: 2 });

		expect(banResult).toBeNull();
		expect(suspensionResult).toBeNull();
	});
});
