import { it, expect, describe, beforeEach, afterAll } from 'bun:test';
import { QueriesRepository } from './repository';
import type { InsertUser } from '../../use-cases/commands/commands-models/Insert';
import { prisma } from '@PrismaClient';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

const {
	selectUserByEmail,
	selectUserById,
	selectUserByNickname,
	selectPublicProfile,
	selectPrivateProfile,
} = QueriesRepository;

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
	await clearDatabase();
	await prisma.user.createMany({
		data: DEFAULT_USERS,
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe('Users Repository', () => {
	describe('Queries', () => {
		describe('selectUserByEmail', () => {
			it('returns a user when email exists', async () => {
				const email = DEFAULT_USERS[0]!.email;

				const user = await selectUserByEmail(email);

				expect(user).toMatchObject({
					email,
					nickname: DEFAULT_USERS[0]!.nickname,
					name: DEFAULT_USERS[0]!.name,
				});
			});

			it('returns null when email does not exist', async () => {
				const user = await selectUserByEmail('invalid@example.com');
				expect(user).toBeNull();
			});
		});

		describe('selectUserByNickname', () => {
			it('returns a user when nickname exists', async () => {
				const nickname = DEFAULT_USERS[1]!.nickname;

				const user = await selectUserByNickname(nickname);

				expect(user).toMatchObject({
					nickname,
					email: DEFAULT_USERS[1]!.email,
				});
			});

			it('returns null when nickname does not exist', async () => {
				const user = await selectUserByNickname('does-not-exist');
				expect(user).toBeNull();
			});
		});

		describe('selectUserById', () => {
			it('returns a user when id exists', async () => {
				const inserted = await prisma.user.create({
					data: EXOTIC_USER,
					select: { id: true },
				});

				const user = await selectUserById(inserted!.id);

				expect(user).toMatchObject({
					id: inserted!.id,
					email: EXOTIC_USER.email,
				});
			});

			it('returns null when id does not exist', async () => {
				const user = await selectUserById(-1);
				expect(user).toBeNull();
			});
		});

		describe('selectAuthUserByEmail', () => {
			it('returns auth credentials when email exists', async () => {
				const email = DEFAULT_USERS[2]!.email;
				const user = await QueriesRepository.selectAuthUserByEmail(email);
				expect(user).toMatchObject({
					email,
					passwordHash: DEFAULT_USERS[2]!.passwordHash,
				});
			});

			it('returns null when email does not exist', async () => {
				const user = await QueriesRepository.selectAuthUserByEmail(
					'invalid@example.com',
				);
				expect(user).toBeNull();
			});
		});

		describe('selectPublicProfile', () => {
			it('returns public profile when id exists', async () => {
				const inserted = await prisma.user.create({
					data: EXOTIC_USER,
					select: { id: true },
				});
				const profile = await selectPublicProfile(inserted!.id);

				expect(profile).toMatchObject({
					id: inserted!.id,
					avatarUrl: EXOTIC_USER.avatarUrl,
					role: 'user',
				});
			});

			it('returns null when id does not exist', async () => {
				const profile = await selectPublicProfile(-1);
				expect(profile).toBeNull();
			});
		});

		describe('selectPrivateProfile', () => {
			it('returns private profile when id exists', async () => {
				const inserted = await prisma.user.create({
					data: EXOTIC_USER,
					select: { id: true },
				});
				const profile = await selectPrivateProfile(inserted!.id);

				expect(profile).toMatchObject({
					id: inserted!.id,
					avatarUrl: EXOTIC_USER.avatarUrl,
					role: 'user',
				});
			});

			it('returns null when id does not exist', async () => {
				const profile = await selectPrivateProfile(-1);
				expect(profile).toBeNull();
			});
		});
	});
});
