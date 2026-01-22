import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'clients',

	useCases: [
		{
			name: 'get-client',
			type: 'query',

			dataModels: [
				{
					name: 'FullClient',
					properties: {
						clientId: 'number[]',
						clientName: 'string',
						clientEmail: 'string',
					},
				},
			],

			errors: [
				{
					name: 'ClientNotFoundError',
					type: 'NOT_FOUND',
					message: 'Client not found.',
				},
			],

			repositoryMethods: [
				{
					name: 'findClientById',
					params: [
						{
							name: 'id',
							type: 'number',
						},
					],
					returns: ['FullClient', 'null'],
				},
			] as const,

			useCaseFunc: {
				params: [
					{
						name: 'id',
						type: 'number',
					},
				],
				returns: ['FullClient', 'null'],
			} as const,

			serviceFunc: {
				params: [
					{
						name: 'id',
						type: 'number',
					},
				],
				returns: ['FullClient', 'null'],
			} as const,

			http: {
				method: 'POST',
				path: '/clients/:id',
				params: [
					{
						name: 'id',
						type: 'number',
					},
				],
				responsesCodes: [200, 404, 400],
				needsAuth: true,
				schemaName: 'GetClientSchema',
			},
		},
	],
});
