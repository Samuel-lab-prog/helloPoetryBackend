import { BcryptHashService } from '@GenericSubdomains/authentication/infra/hashing/BcryptHashService';
import type { InsertUser } from './InsertModel';

export async function createUserSeeds(): Promise<InsertUser[]> {
	const passwords = await Promise.all([
		BcryptHashService.hash('normaluserpassword'),
		BcryptHashService.hash('autorpassword'),
		BcryptHashService.hash('moderatorpassword'),
	]);

	return [
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
}
