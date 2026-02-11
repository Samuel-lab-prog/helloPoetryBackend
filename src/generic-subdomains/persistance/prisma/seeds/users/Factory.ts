function pick<T>(list: T[]): T | undefined {
	if (list.length === 0) return undefined;
	return list[Math.floor(Math.random() * list.length)];
}

const FIRST_NAMES = [
	'Lucas',
	'Marina',
	'Rafael',
	'Beatriz',
	'Pedro',
	'Ana',
	'Gabriel',
	'Camila',
	'Bruno',
	'Julia',
	'Diego',
	'Larissa',
	'Paulo',
	'Renata',
];

const LAST_NAMES = [
	'Ferreira',
	'Costa',
	'Almeida',
	'Santos',
	'Rocha',
	'Ribeiro',
	'Martins',
	'Silva',
];

const BIOS = [
	'Coffee lover and tech enthusiast.',
	'Writer and nature admirer.',
	'Lover of books and art.',
	'Sharing thoughts and small poems.',
	'Just exploring new ideas.',
	'Dreamer and storyteller.',
	'Minimalist and curious mind.',
];

type UserRole = 'admin' | 'author' | 'moderator';

function randomRole(): UserRole {
	const roll = Math.random();

	if (roll < 0.7) return 'admin';
	if (roll < 0.95) return 'author';
	return 'moderator';
}

function generateUser(index: number, passwordHash: string) {
	const first = pick(FIRST_NAMES);
	const last = pick(LAST_NAMES);

	const name = `${first} ${last}`;
	const nickname = `${first?.toLowerCase() ?? ''}${last?.toLowerCase() ?? ''}${index}`;
	const email = `${nickname}@gmail.com`;

	return {
		name,
		nickname,
		email,
		passwordHash,
		bio: pick(BIOS) || '',
		avatarUrl: `https://i.pravatar.cc/150?img=${index + 1}`,
		role: randomRole(),
	};
}

import { BcryptHashService } from '@SharedKernel/infra/Bcrypt';

export async function createUserSeeds(amount: number) {
	const passwordHash = await BcryptHashService.hash('defaultpassword');

	const users = Array.from({ length: amount }).map((_, index) =>
		generateUser(index, passwordHash),
	);

	return users;
}
