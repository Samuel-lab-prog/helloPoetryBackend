import { it, expect, describe, beforeEach } from 'bun:test';
import { commandsRepository } from './repository';
import type { InsertUser } from '../../use-cases/commands/models/Insert';
import { prisma } from '@PrismaClient';
import { clearDatabase } from '@ClearDatabase';

const { insertUser, updateUser, softDeleteUser } = commandsRepository;

const DEFAULT_USERS: InsertUser[] = [
	{
		nickname: 'testuser',
		email: 'testuser@example.com',
		name: 'Test User',
		passwordHash: 'hashedpassword',
		bio: 'This is a test user.',
		avatarUrl: 'http://example.com/avatar.png',
	},
	{
		nickname: 'seconduser',
		email: 'seconduser@gmail.com',
		name: 'Second User',
		passwordHash: 'anotherhashedpassword',
		bio: 'This is the second test user.',
		avatarUrl: 'http://example.com/avatar2.png',
	},
];

const EXOTIC_USER: InsertUser = {
	nickname: 'exotic_user-123',
	email: 'imspecial.haha@gmail.com',
	name: 'Exotic User',
	passwordHash: 'exotichashedpassword',
	bio: 'I am an exotic user with special characters!',
	avatarUrl: 'http://example.com/exotic_avatar.png',
};

beforeEach(async () => {
	await clearDatabase();
	await prisma.user.createMany({
		data: DEFAULT_USERS,
	});
});

describe('CommandsRepository', () => {
	// ----------------------------------
	// INSERT
	// ----------------------------------

	describe('insertUser', () => {
		it('returns ok:true and id when successful', async () => {
			const result = await insertUser(EXOTIC_USER);

			expect(result.ok).toBe(true);
			expect(result).toMatchObject({
				ok: true,
			});
		});

		it('returns DUPLICATE_EMAIL when email already exists', async () => {
			const result = await insertUser({
				...EXOTIC_USER,
				email: DEFAULT_USERS[0]!.email,
			});

			expect(result).toMatchObject({
				ok: false,
				failureReason: 'DUPLICATE_EMAIL',
			});
		});

		it('returns DUPLICATE_NICKNAME when nickname already exists', async () => {
			const result = await insertUser({
				...EXOTIC_USER,
				nickname: DEFAULT_USERS[0]!.nickname,
			});

			expect(result).toMatchObject({
				ok: false,
				failureReason: 'DUPLICATE_NICKNAME',
			});
		});
	});

	// ----------------------------------
	// UPDATE
	// ----------------------------------

	describe('updateUser', () => {
		it('returns ok:true when update succeeds', async () => {
			const inserted = await insertUser(EXOTIC_USER);
			expect(inserted.ok).toBe(true);

			if (!inserted.ok) {
				throw new Error('Expected insertion to succeed');
			}

			const result = await updateUser(inserted.data.id, {
				name: 'Updated Name',
				bio: 'Updated bio',
			});

			expect(result).toMatchObject({
				ok: true,
			});
		});

		it('returns DB_ERROR when user does not exist', async () => {
			const result = await updateUser(-1, {
				bio: 'Should fail',
			});

			expect(result).toMatchObject({
				ok: false,
				failureReason: 'DB_ERROR',
			});
		});

		// ----------------------------------
		// SOFT DELETE
		// ----------------------------------

		describe('softDeleteUser', () => {
			it('returns ok:true when user is soft deleted', async () => {
				const inserted = await insertUser(EXOTIC_USER);
				expect(inserted.ok).toBe(true);

				if (!inserted.ok) {
					throw new Error('Expected insertion to succeed');
				}

				const result = await softDeleteUser(inserted.data.id);

				expect(result).toMatchObject({
					ok: true,
					data: inserted.data,
				});
			});

			it('returns DB_ERROR when user does not exist', async () => {
				const result = await softDeleteUser(-1);

				expect(result).toMatchObject({
					ok: false,
					failureReason: 'DB_ERROR',
				});
			});
		});
	});
});
