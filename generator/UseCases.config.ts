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
				{
					name: 'ClientSummary',
					properties: {
						clientId: 'number',
						clientName: 'string',
					},
				},
			],

			errors: [
				{
					name: 'ClientNotFoundError',
					type: 'NOT_FOUND',
					message: 'Client not found.',
				},
				{
					name: 'ClientValidationError',
					type: 'VALIDATION_FAILED',
					message: 'Client data is invalid.',
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
				{
					name: 'listAllClients',
					params: [],
					returns: ['ClientSummary[]'],
				},
				{
					name: 'deleteClient',
					params: [
						{
							name: 'id',
							type: 'number',
						},
					],
					returns: ['void'],
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
