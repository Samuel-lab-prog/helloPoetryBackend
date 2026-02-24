import { prisma } from '../../PrismaClient';
import { generateCommentSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedComments(
	userIds: number[],
	poemIds: number[],
	quantity: number,
) {
	const comments = generateCommentSeeds(userIds, poemIds, quantity);

	await Promise.all(
		comments.map((comment) => prisma.comment.create({ data: comment })),
	);

	console.log(green('✅ Comments seeded successfully!'));
}
