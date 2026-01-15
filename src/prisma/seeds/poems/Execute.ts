import { prisma } from '../../myClient';
import { createPoemSeeds } from './Factory';

export async function seedPoems(params: { authorId: number }) {
	const poems = createPoemSeeds({
		authorId: params.authorId,
	});

	const promises = poems.map(async (poem) => {
		await prisma.poem.create({
			data: {
				title: poem.title,
				excerpt: poem.excerpt,
				slug: poem.slug,
				content: poem.content,
				isCommentable: poem.isCommentable,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
				authorId: poem.authorId,
				tags: {
					connectOrCreate: poem.tags.map((tagName) => ({
						where: { name: tagName },
						create: { name: tagName },
					})),
				},
			},
		});
	});
	await Promise.all(promises);

	console.log('Poems seeded successfully!');
}
