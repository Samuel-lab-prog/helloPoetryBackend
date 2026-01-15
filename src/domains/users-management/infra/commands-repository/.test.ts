import { it, expect, describe, beforeEach, afterAll } from 'bun:test';
import { CommandsRepository } from './repository';
import type { InsertUser } from '../../use-cases/commands/commands-models/Insert';
import { prisma } from '../../../../prisma/myClient';

const { insertUser, softDeleteUser, updateUser } = CommandsRepository;

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
	{
		nickname: 'thirduser',
		email: 'thirduser@example.com',
		name: 'Third User',
		passwordHash: 'yetanotherhashedpassword',
		bio: 'This is the third test user.',
		avatarUrl: 'http://example.com/avatar3.png',
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
	await prisma.poem.deleteMany();
	await prisma.user.deleteMany();
	await prisma.user.createMany({
		data: DEFAULT_USERS,
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe('Users Repository', () => {
	describe('Commands', () => {
		describe('insertUser', () => {
			it('persists and returns the created user id', async () => {
				const user = await insertUser(EXOTIC_USER);

				expect(user).toMatchObject({
					id: expect.any(Number),
				});
			});

			it('throws when nickname already exists', async () => {
				await expect(
					insertUser({
						...EXOTIC_USER,
						nickname: DEFAULT_USERS[0]!.nickname,
					}),
				).rejects.toThrow();
			});

			it('throws when email already exists', async () => {
				await expect(
					insertUser({
						...EXOTIC_USER,
						email: DEFAULT_USERS[0]!.email,
					}),
				).rejects.toThrow();
			});
		});

		describe('softDeleteUser', () => {
			it('marks user as deleted', async () => {
				const inserted = await insertUser(EXOTIC_USER);

				const deletedUser = await softDeleteUser(inserted!.id);

				expect(deletedUser?.id).toBe(inserted!.id);
			});

			it('throws when user does not exist', async () => {
				await expect(softDeleteUser(-1)).rejects.toThrow();
			});
		});

		describe('updateUser', () => {
			it('updates mutable fields of an existing user', async () => {
				const inserted = await insertUser(EXOTIC_USER);

				const updatedUser = await updateUser(inserted!.id, {
					bio: 'Updated bio',
					name: 'Updated Name',
				});

				expect(updatedUser).toMatchObject({
					id: inserted!.id,
				});
			});

			it('throws when user does not exist', async () => {
				await expect(updateUser(-1, { bio: 'Should fail' })).rejects.toThrow();
			});
		});
	});
});
