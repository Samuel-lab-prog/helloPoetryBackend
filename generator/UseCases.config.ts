import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'clients',

	useCases: [
		{
			name: 'get-client',
			type: 'query',

			dataModels: {
				FullClient: {
					clientId: 'number[]',
					clientName: 'string',
					clientEmail: 'string',
				},
			},

			errors: {
				ClientNotFoundError: {
					type: 'NOT_FOUND',
					message: 'Client not found.',
				},
			},

			repositoryMethods: {
				findClientById: {
					params: {
						id: 'number',
					},
					returns: ['FullClient', 'null'],
				} as const,
			},

			useCaseFunc: {
				params: {
					id: 'number',
				},
				returns: ['FullClient', 'null'],
			} as const,

			serviceFunc: {
				params: {
					id: 'number',
				},
				returns: ['FullClient', 'null'],
			} as const,

			http: {
				method: 'POST',
				path: '/clients/:id',
				params: {
					id: 'number',
				},
				responsesCodes: [200, 404, 400],
				needsAuth: true,
				schemaName: 'GetClientSchema',
			},
		},
	],
});
