import { prisma } from '../../PrismaClient';
import { generatePoemSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedPoems(authorIds: number[], quantity: number) {
	const poems = generatePoemSeeds(authorIds, quantity);

	await Promise.all(
		poems.map((poem) =>
			prisma.poem.create({
				data: poem,
			}),
		),
	);
	console.log(green('✅ Poems seeded successfully!'));
}
