import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'interactions',

	useCases: [
		{
			name: 'unlike-poem',
			type: 'command',

			dataModels: [
				{
					name: 'PoemLike',
					properties: {
						userId: 'number',
						poemId: 'number',
						createdAt: 'string',
					},
				},
			],

			errors: [
				{
					name: 'PoemNotFoundError',
					type: 'NOT_FOUND',
					message: 'Poem not found.',
				},
				{
					name: 'LikeNotFoundError',
					type: 'NOT_FOUND',
					message: 'Like not found.',
				},
			],

			repositoryMethods: [
				{
					name: 'findPoemById',
					params: [{ name: 'poemId', type: 'number' }],
					returns: ['number', 'null'],
					body: `
				const poem = await prisma.poem.findUnique({
					where: { id: poemId },
					select: { id: true },
				});
				return poem?.id ?? null;
			`.trim(),
				},
				{
					name: 'findPoemLike',
					params: [
						{ name: 'userId', type: 'number' },
						{ name: 'poemId', type: 'number' },
					],
					returns: ['PoemLike', 'null'],
					body: `
				return prisma.poemLike.findUnique({
					where: {
						userId_poemId: {
							userId,
							poemId,
						},
					},
				});
			`.trim(),
				},
				{
					name: 'deletePoemLike',
					params: [
						{ name: 'userId', type: 'number' },
						{ name: 'poemId', type: 'number' },
					],
					returns: ['PoemLike'],
					body: `
				return prisma.poemLike.delete({
					where: {
						userId_poemId: {
							userId,
							poemId,
						},
					},
				});
			`.trim(),
				},
			] as const,

			useCaseFunc: {
				params: [
					{ name: 'userId', type: 'number' },
					{ name: 'poemId', type: 'number' },
				],
				returns: ['PoemLike'],
				body: `
			const poemExists =
				await repository.findPoemById(poemId);

			if (!poemExists) {
				throw new PoemNotFoundError();
			}

			const existingLike =
				await repository.findPoemLike(
					userId,
					poemId,
				);

			if (!existingLike) {
				throw new LikeNotFoundError();
			}

			return repository.deletePoemLike(
				userId,
				poemId,
			);
		`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'unlikePoem',
					params: [{ userId: 'number' }, { poemId: 'number' }],
					returns: ['PoemLike'],
				},
			],
		},
	],
});
