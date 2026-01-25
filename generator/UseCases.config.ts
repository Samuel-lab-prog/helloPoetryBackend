import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'interactions',

	useCases: [
		{
			name: 'like-poem',
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
					name: 'AlreadyLikedError',
					type: 'CONFLICT',
					message: 'User already liked this poem.',
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
					name: 'createPoemLike',
					params: [
						{ name: 'userId', type: 'number' },
						{ name: 'poemId', type: 'number' },
					],
					returns: ['PoemLike'],
					body: `
						return prisma.poemLike.create({
							data: {
								userId,
								poemId,
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

					if (existingLike) {
						throw new AlreadyLikedError();
					}

					return repository.createPoemLike(
						userId,
						poemId,
					);
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'likePoem',
					params: [{ userId: 'number' }, { poemId: 'number' }],
					returns: ['PoemLike'],
				},
			],
		},
	],
});
