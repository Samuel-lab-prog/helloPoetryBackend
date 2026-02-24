import { prisma } from '../../prismaClient';
import { generatePoemLikeSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedPoemLikes(
	userIds: number[],
	poemIds: number[],
	quantity: number,
) {
	const likes = generatePoemLikeSeeds(userIds, poemIds, quantity);

	await Promise.all(
		likes.map((like) => prisma.poemLike.create({ data: like })),
	);

	console.log(green('✅ Poem likes seeded successfully!'));
}
