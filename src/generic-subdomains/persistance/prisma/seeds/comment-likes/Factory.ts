import type { Prisma } from '../../generated/client';

function randomPair(users: number[], comments: number[]) {
	return [
		users[Math.floor(Math.random() * users.length)],
		comments[Math.floor(Math.random() * comments.length)],
	];
}

export function generateCommentLikeSeeds(
	userIds: number[],
	commentIds: number[],
	quantity: number,
): Prisma.CommentLikeCreateInput[] {
	const likes: Prisma.CommentLikeCreateInput[] = [];
	const used = new Set<string>();

	while (likes.length < quantity) {
		const [userId, commentId] = randomPair(userIds, commentIds);
		const key = `${userId}-${commentId}`;

		if (used.has(key)) continue;
		used.add(key);

		likes.push({
			user: { connect: { id: userId } },
			comment: { connect: { id: commentId } },
		});
	}

	return likes;
}
