import { prisma } from '../../PrismaClient';
import { generateCommentLikeSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedCommentLikes(
	userIds: number[],
	commentIds: number[],
	quantity: number,
) {
	const likes = generateCommentLikeSeeds(userIds, commentIds, quantity);

	await Promise.all(
		likes.map((like) => prisma.commentLike.create({ data: like })),
	);

	console.log(green('✅ Comment likes seeded successfully!'));
}
