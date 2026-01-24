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
						clientId: 'number',
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
					body: `
						// Repository implementation goes here
						const client = await prisma.user.findUnique({
							where: { id },
						});
						return client;
					`.trim(),
					selectModel: {
						name: 'clientSelectModel',
						body: `
					id: true,
					name: true,
					email: true,
				`.trim(),
					},
				},
				{
					name: 'listAllClients',
					params: [],
					returns: ['ClientSummary[]'],
					body: `
						// Repository implementation goes here
						const clients = await prisma.user.findMany({
							select: clientSelectModel,
						});
						return clients;
					`.trim(),
					selectModel: {
						name: 'clientSelectModel',
						body: `
					id: true,
					name: true,
				`.trim(),
					},
				},

				{
					selectModel: {
						name: 'clientSelectModel',
						body: `
					id: true,
					name: true,
					email: true,
				`.trim(),
					},
					name: 'deleteClient',
					params: [
						{
							name: 'id',
							type: 'number',
						},
					],
					returns: ['void'],
					body: `
				// Repository implementation goes here
				await prisma.user.delete({
					where: { id },
				});
			`.trim(),
				},
			] as const,

			useCaseFunc: {
				params: [
					{
						name: 'id',
						type: 'number',
					},
				],
				returns: ['FullClient', 'ClientSummary', 'null'],
				body: `
					// Use case implementation goes here
					const client = await repository.findClientById(id);
					if (!client) {
						throw new ClientNotFoundError();
					}
					return client;
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'getClient',
					params: [{ id: 'number' }, { requesterId: 'number' }],
					returns: ['FullClient', 'ClientSummary', 'null'],
				},
			],

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
			dtos: [
				{
					inputModel: 'FullClient',
					outputModel: 'ClientSummary',
					body: `
						return {
							clientId: input.clientId,
							clientName: input.clientName,
						}
					`.trim(),
				},
			],
			policies: [
				{
					name: 'canAccessClientInfo',
					parameters: {
						requesterId: 'number',
						requesterRole: 'string',
						targetId: 'number',
					},
					body: `
								return requesterRole === 'admin' || requesterId === targetId;
						`.trim(),
				},
				{
					name: 'isAdminUser',
					parameters: {
						userRole: 'string',
					},
					body: `
								return userRole === 'admin';
						`.trim(),
				},
			],
		},
	],
});
