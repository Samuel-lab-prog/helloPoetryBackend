import type { Prisma } from '../../generated/client';

function randomPair(users: number[], poems: number[]) {
	return [
		users[Math.floor(Math.random() * users.length)],
		poems[Math.floor(Math.random() * poems.length)],
	];
}

export function generatePoemLikeSeeds(
	userIds: number[],
	poemIds: number[],
	quantity: number,
): Prisma.PoemLikeCreateInput[] {
	const likes: Prisma.PoemLikeCreateInput[] = [];
	const used = new Set<string>();

	while (likes.length < quantity) {
		const [userId, poemId] = randomPair(userIds, poemIds);
		const key = `${userId}-${poemId}`;

		if (used.has(key)) continue;
		used.add(key);

		likes.push({
			user: { connect: { id: userId } },
			poem: { connect: { id: poemId } },
		});
	}

	return likes;
}
