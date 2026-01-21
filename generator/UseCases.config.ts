import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'hey',

	useCases: [
		{
			name: 'buscar-betinha',
			type: 'command',

			dataModels: {
				GetBetinha: {
					betinhaFriendsIds: 'number[]',
					betinhaName: 'string',
				},
			},

			errors: {
				BetinhaNotFoundError: {
					type: 'NOT_FOUND',
					message: 'Não pudemos encontrar o betinha. Nunca sobra nada pro beta',
				},
			},

			repositoryMethods: {
				findBetinhaById: {
					params: {
						id: 'number',
					},
					returns: ['GetBetinha', 'null'],
				} as const,
			},

			useCaseFunc: {
				params: {
					id: 'number',
				},
				returns: ['GetBetinha', 'null'],
			} as const,

			serviceFunc: {
				params: {
					id: 'number',
				},
				returns: ['GetBetinha', 'null'],
			} as const,

			http: {
				method: 'POST',
				path: '/users/:id/buscar-betinha',
				params: {
					id: 'number',
				},
				responsesCodes: [200, 404, 400],
				needsAuth: true,
				schemaName: 'GetBetinhaSchema',
			},
		},
	],
});
