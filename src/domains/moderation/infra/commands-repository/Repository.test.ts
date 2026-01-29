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

describe('commandsRepository (Prisma) - createBan & createSuspension', () => {
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

	it('createBan should insert a ban record', async () => {
		const ban = await commandsRepository.createBan({
			userId: 2,
			reason: 'Breaking rules',
			moderatorId: 1,
		});

		expect(ban).toMatchObject({
			userId: 2,
			moderatorId: 1,
			reason: 'Breaking rules',
		});
		expect(ban.id).toBeDefined();
		expect(ban.startAt).toBeInstanceOf(Date);
		expect(ban.endAt).toBeNull();
	});

	it('createSuspension should insert a suspension record', async () => {
		const suspension = await commandsRepository.createSuspension({
			userId: 2,
			reason: 'Temporary block',
			moderatorId: 1,
		});

		expect(suspension).toMatchObject({
			userId: 2,
			moderatorId: 1,
			reason: 'Temporary block',
		});
		expect(suspension.id).toBeDefined();
		expect(suspension.startAt).toBeInstanceOf(Date);
	});

	it('should handle special characters in reason', async () => {
		const reason = "Violation: 'Quotes' & emojis 😎";
		const ban = await commandsRepository.createBan({
			userId: 2,
			reason,
			moderatorId: 1,
		});

		expect(ban.reason).toBe(reason);
	});

	it('should return null/throw if user does not exist (DB constraint)', async () => {
		let error;
		try {
			await commandsRepository.createBan({
				userId: 9999, // non-existent
				reason: 'Invalid user',
				moderatorId: 1,
			});
		} catch (err) {
			error = err;
		}
		expect(error).toBeDefined();
	});
});
