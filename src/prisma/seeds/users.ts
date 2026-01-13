import { BcryptHashService } from '@GenericSubdomains/authentication/infra/hashing/BcryptHashService';
import { prisma } from '../myClient';

const passwordsPromises = [
	BcryptHashService.hash('normaluserpassword'),
	BcryptHashService.hash('autorpassword'),
	BcryptHashService.hash('moderatorpassword'),
];

type InsertUser = {
	name: string;
	nickname: string;
	email: string;
	passwordHash: string;
	bio: string;
	avatarUrl: string;
};

const passwords = await Promise.all(passwordsPromises);

export const UserSeeds: InsertUser[] = [
	{
		name: 'Normal User',
		nickname: 'normaluser',
		email: 'normaluser@gmail.com',
		passwordHash: passwords[0]!,
		bio: 'I am a normal user.',
		avatarUrl: 'https://i.pravatar.cc/150?img=1',
	},
	{
		name: 'Autor User',
		nickname: 'autoruser',
		email: 'autoruser@gmail.com',
		passwordHash: passwords[1]!,
		bio: 'I am an autor user.',
		avatarUrl: 'https://i.pravatar.cc/150?img=2',
	},
	{
		name: 'Moderator User',
		nickname: 'moderatoruser',
		email: 'moderatoruser@gmail.com',
		passwordHash: passwords[2]!,
		bio: 'I am a moderator user.',
		avatarUrl: 'https://i.pravatar.cc/150?img=3',
	},
];

const usersPromises = prisma.user.createMany({
	data: UserSeeds,
	skipDuplicates: true,
});

export async function seedUsers() {
	await usersPromises;
	console.log('Users seeded successfully!');
}
