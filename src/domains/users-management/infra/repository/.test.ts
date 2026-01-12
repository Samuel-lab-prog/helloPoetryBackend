import { it, expect, describe, beforeEach } from 'bun:test';
import { QueriesRepository, CommandsRepository } from './repository';
import type { InsertUser } from '../../commands/commandsModels';
import { prisma } from '../../../../prisma/myClient';

const { insertUser, softDeleteUser, updateUser } = CommandsRepository;

const { selectUserByEmail, selectUserById, selectUserByNickname } =
	QueriesRepository;

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
	await prisma.user.deleteMany();
	await prisma.user.createMany({
		data: DEFAULT_USERS,
	});
});

describe('Users Repository (Integration)', () => {
	describe('Queries', () => {
		describe('selectUserByEmail', () => {
			it('returns a full user when email exists', async () => {
				const email = DEFAULT_USERS[0]!.email;

				const user = await selectUserByEmail(email);

				expect(user).not.toBeNull();
				expect(user?.email).toBe(email);
				expect(user?.nickname).toBe(DEFAULT_USERS[0]!.nickname);
			});

			it('returns null when email does not exist', async () => {
				const user = await selectUserByEmail('invalid@example.com');
				expect(user).toBeNull();
			});
		});

		describe('selectUserByNickname', () => {
			it('returns a full user when nickname exists', async () => {
				const nickname = DEFAULT_USERS[1]!.nickname;

				const user = await selectUserByNickname(nickname);

				expect(user).not.toBeNull();
				expect(user?.nickname).toBe(nickname);
			});

			it('returns null when nickname does not exist', async () => {
				const user = await selectUserByNickname('does-not-exist');
				expect(user).toBeNull();
			});
		});

		describe('selectUserById', () => {
			it('returns a full user when id exists', async () => {
				const inserted = await insertUser(EXOTIC_USER);

				const user = await selectUserById(inserted!.id);

				expect(user).not.toBeNull();
				expect(user?.id).toBe(inserted!.id);
			});

			it('returns null when id does not exist', async () => {
				const user = await selectUserById(-1);
				expect(user).toBeNull();
			});
		});
	});

	describe('Commands', () => {
		describe('insertUser', () => {
			it('inserts a user and returns the persisted entity', async () => {
				const user = await insertUser(EXOTIC_USER);

				expect(user).not.toBeNull();
				expect(user?.email).toBe(EXOTIC_USER.email);
				expect(user?.nickname).toBe(EXOTIC_USER.nickname);
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
			it('soft deletes an existing user', async () => {
				const inserted = await insertUser(EXOTIC_USER);

				const deletedUser = await softDeleteUser(inserted!.id);

				expect(deletedUser).not.toBeNull();
				expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
			});

			it('throws when user does not exist', async () => {
				await expect(softDeleteUser(-1)).rejects.toThrow();
			});
		});
		describe('updateUser', () => {
			it('updates an existing user', async () => {
				const inserted = await insertUser(EXOTIC_USER);
				const updatedData = {
					bio: 'Updated bio for exotic user.',
					name: 'Updated Exotic User',
				};
				const updatedUser = await updateUser(inserted!.id, updatedData);

				expect(updatedUser).not.toBeNull();
				expect(updatedUser?.bio).toBe(updatedData.bio);
				expect(updatedUser?.name).toBe(updatedData.name);
			});

			it('throws when user does not exist', async () => {
				const updatedData = {
					bio: 'This update should fail.',
				};
				await expect(updateUser(-1, updatedData)).rejects.toThrow();
			});
		});
	});
});
