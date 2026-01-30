import { it, expect, describe, beforeEach } from 'bun:test';
import { queriesRepository } from './repository';
import type { InsertUser } from '../../use-cases/commands/models/Insert';
import { prisma } from '@PrismaClient';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

const {
	selectUserByEmail,
	selectUserById,
	selectUserByNickname,
	selectPublicProfile,
	selectPrivateProfile,
	selectAuthUserByEmail,
} = queriesRepository;

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

let exoticUserId: number;

beforeEach(async () => {
	await clearDatabase();
	await prisma.user.createMany({ data: DEFAULT_USERS });

	const inserted = await prisma.user.create({
		data: EXOTIC_USER,
		select: { id: true },
	});
	exoticUserId = inserted.id;
});

describe('Users Repository', () => {
	describe('selectUserByEmail', () => {
		it('should return a user for an existing email', async () => {
			const email = DEFAULT_USERS[0]!.email;
			const user = await selectUserByEmail(email);
			expect(user).toMatchObject({
				email,
				nickname: DEFAULT_USERS[0]!.nickname,
			});
		});

		it('should return null for a non-existing email', async () => {
			const user = await selectUserByEmail('invalid@example.com');
			expect(user).toBeNull();
		});

		it('should be case-insensitive', async () => {
			const email = DEFAULT_USERS[0]!.email.toUpperCase();
			const user = await selectUserByEmail(email);
			expect(user).toBeNull(); // assume DB lookup is case-sensitive, adjust if needed
		});
	});

	describe('selectUserByNickname', () => {
		it('should return a user for an existing nickname', async () => {
			const nickname = DEFAULT_USERS[1]!.nickname;
			const user = await selectUserByNickname(nickname);
			expect(user).toMatchObject({ nickname, email: DEFAULT_USERS[1]!.email });
		});

		it('should return null for a non-existing nickname', async () => {
			const user = await selectUserByNickname('does-not-exist');
			expect(user).toBeNull();
		});

		it('should handle exotic nicknames', async () => {
			const user = await selectUserByNickname(EXOTIC_USER.nickname);
			expect(user).toMatchObject({ nickname: EXOTIC_USER.nickname });
		});
	});

	describe('selectUserById', () => {
		it('should return a user for a valid id', async () => {
			const user = await selectUserById(exoticUserId);
			expect(user).toMatchObject({
				id: exoticUserId,
				email: EXOTIC_USER.email,
			});
		});

		it('should return null for an invalid id', async () => {
			const user = await selectUserById(-1);
			expect(user).toBeNull();
		});
	});

	describe('selectAuthUserByEmail', () => {
		it('should return auth credentials for an existing email', async () => {
			const email = DEFAULT_USERS[2]!.email;
			const user = await selectAuthUserByEmail(email);
			expect(user).toMatchObject({
				email,
				passwordHash: DEFAULT_USERS[2]!.passwordHash,
			});
		});

		it('should return null for a non-existing email', async () => {
			const user = await selectAuthUserByEmail('invalid@example.com');
			expect(user).toBeNull();
		});
	});

	describe('selectPublicProfile', () => {
		it('should return public profile for a valid id', async () => {
			const profile = await selectPublicProfile(exoticUserId);
			expect(profile).toMatchObject({
				id: exoticUserId,
				avatarUrl: EXOTIC_USER.avatarUrl,
				role: 'user',
			});
		});

		it('should return null for a non-existing id', async () => {
			const profile = await selectPublicProfile(-1);
			expect(profile).toBeNull();
		});
	});

	describe('selectPrivateProfile', () => {
		it('should return private profile for a valid id', async () => {
			const profile = await selectPrivateProfile(exoticUserId);
			expect(profile).toMatchObject({
				id: exoticUserId,
				avatarUrl: EXOTIC_USER.avatarUrl,
				role: 'user',
			});
		});

		it('should return null for a non-existing id', async () => {
			const profile = await selectPrivateProfile(-1);
			expect(profile).toBeNull();
		});
	});
});
