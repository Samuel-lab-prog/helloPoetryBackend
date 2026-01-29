import { BcryptHashService } from '@GenericSubdomains/authentication/infra/hashing/BcryptHashService';

export async function createUserSeeds() {
	const passwords = await Promise.all([
		BcryptHashService.hash('normalpassword'),
		BcryptHashService.hash('authorpassword'),
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
			role: 'user' as const,
		},
		{
			name: 'Author User',
			nickname: 'authoruser',
			email: 'authoruser@gmail.com',
			passwordHash: passwords[1]!,
			bio: 'I am an author user.',
			avatarUrl: 'https://i.pravatar.cc/150?img=2',
			role: 'author' as const,
		},
		{
			name: 'Moderator User',
			nickname: 'moderatoruser',
			email: 'moderatoruser@gmail.com',
			passwordHash: passwords[2]!,
			bio: 'I am a moderator user.',
			avatarUrl: 'https://i.pravatar.cc/150?img=3',
			role: 'moderator' as const,
		},
	];
}
