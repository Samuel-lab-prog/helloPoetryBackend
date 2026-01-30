import type { Prisma } from '../../generated/client';

const COMMENTS = [
	'Gostei muito.',
	'Lindo poema.',
	'Isso me tocou.',
	'Excelente!',
	'Profundo.',
	'Me identifiquei.',
	'Incrível.',
	'Sensível.',
	'Muito bom.',
	'Gostei bastante.',
];

function pick<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCommentSeeds(
	userIds: number[],
	poemIds: number[],
	quantity: number,
): Prisma.CommentCreateInput[] {
	const comments: Prisma.CommentCreateInput[] = [];

	for (let i = 0; i < quantity; i++) {
		const authorId = pick(userIds);
		const poemId = pick(poemIds);

		comments.push({
			content: pick(COMMENTS) || 'Ótimo poema!',
			author: { connect: { id: authorId } },
			poem: { connect: { id: poemId } },
		});
	}

	return comments;
}
