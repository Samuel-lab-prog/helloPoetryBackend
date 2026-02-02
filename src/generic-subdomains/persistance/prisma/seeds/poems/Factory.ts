import type { Prisma } from '../../generated/client';
import type {
	PoemVisibility,
	PoemModerationStatus,
	PoemStatus,
} from '@SharedKernel/Enums';

const WORDS = [
	'silencio',
	'tempo',
	'memoria',
	'noite',
	'vento',
	'caminho',
	'eco',
	'sol',
	'sombra',
	'vida',
	'caos',
	'paz',
	'amor',
	'vazio',
	'esperanca',
];

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}
function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}
function generateTitle(): string {
	return `${randomItem(WORDS)} ${randomItem(WORDS)}`;
}
function generateContent(): string {
	return `${randomItem(WORDS)} ${randomItem(WORDS)}
${randomItem(WORDS)} ${randomItem(WORDS)}
${randomItem(WORDS)} ${randomItem(WORDS)}`;
}
function randomVisibility(): PoemVisibility {
	const values: PoemVisibility[] = ['public', 'friends', 'private'];
	return values[Math.floor(Math.random() * values.length)]!;
}
function randomStatus(): PoemStatus {
	const values: PoemStatus[] = ['draft', 'published'];
	return values[Math.floor(Math.random() * values.length)]!;
}
function randomModerationStatus(): PoemModerationStatus {
	const values: PoemModerationStatus[] = ['pending', 'approved', 'rejected'];
	return values[Math.floor(Math.random() * values.length)]!;
}
function generateTags(): string[] {
	return Array.from(
		new Set([randomItem(WORDS), randomItem(WORDS), randomItem(WORDS)]),
	);
}

export function generatePoemSeeds(
	authorIds: number[],
	quantity: number,
): Prisma.PoemCreateInput[] {
	if (!authorIds.length) {
		throw new Error('generatePoemSeeds requires at least one authorId');
	}

	return Array.from({ length: quantity }).map((_, i) => {
		const title = generateTitle();

		return {
			title,
			slug: slugify(`${title}-${i}`),
			excerpt: generateContent().split('\n')[0],
			content: generateContent(),
			visibility: randomVisibility(),
			status: randomStatus(),
			moderationStatus: randomModerationStatus(),
			author: {
				connect: {
					id: randomItem(authorIds),
				},
			},
			tags: {
				connectOrCreate: generateTags().map((tag) => ({
					where: { name: tag },
					create: { name: tag },
				})),
			},
		};
	});
}
