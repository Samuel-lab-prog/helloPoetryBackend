import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'interactions',

	useCases: [
		{
	name: 'get-poem-comments',
	type: 'query',

	dataModels: [
		{
			name: 'PoemComment',
			properties: {
				id: 'number',
				userId: 'number',
				poemId: 'number',
				content: 'string',
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
			name: 'findCommentsByPoemId',
			params: [{ name: 'poemId', type: 'number' }],
			returns: ['PoemComment'],
			body: `
				return prisma.poemComment.findMany({
					where: { poemId },
					orderBy: { createdAt: 'desc' },
				});
			`.trim(),
		},
	],

	useCaseFunc: {
		params: [{ name: 'poemId', type: 'number' }],
		returns: ['PoemComment'],
		body: `
			const poemExists =
				await repository.findPoemById(poemId);

			if (!poemExists) {
				throw new PoemNotFoundError();
			}

			return repository.findCommentsByPoemId(poemId);
		`.trim(),
	} as const,

	serviceFunctions: [
		{
			useCaseFuncName: 'getPoemComments',
			params: [{ poemId: 'number' }],
			returns: ['PoemComment'],
		},
	],
},
	],
});
