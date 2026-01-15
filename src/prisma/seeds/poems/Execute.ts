import { prisma } from '../../myClient';
import { createPoemSeeds } from './Factory';

export async function seedPoems(params: { authorId: number }) {
	const poems = createPoemSeeds({
		authorId: params.authorId,
	});

	await prisma.poem.createMany({
		data: poems,
		skipDuplicates: true,
	});

	console.log('Poems seeded successfully!');
}
