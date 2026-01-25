import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'moderation',

	useCases: [
		{
			name: 'suspend-user',
			type: 'command',

			dataModels: [
				{
					name: 'UserSuspension',
					properties: {
						id: 'number',
						userId: 'number',
						reason: 'string',
						startAt: 'string',
						moderatorId: 'number',
					},
				},
			],

			errors: [
				{
					name: 'UserNotFoundError',
					type: 'NOT_FOUND',
					message: 'User not found.',
				},
				{
					name: 'UserAlreadySuspendedError',
					type: 'CONFLICT',
					message: 'User is already suspended.',
				},
			],

			repositoryMethods: [
				{
					name: 'selectActiveSuspensionByUserId',
					params: [{ name: 'userId', type: 'number' }],
					returns: ['UserSuspension | null'],
					body: `
				return prisma.userSanctions.findFirst({
					where: { userId, endAt: null },
				});
			`.trim(),
				},
			],

			// Função principal do  case
			useCaseFunc: {
				params: [
					{ name: 'userId', type: 'number' },
					{ name: 'reason', type: 'string' },
					{ name: 'moderatorId', type: 'number' },
				],
				returns: ['UserSuspension'],
				body: `
			const { userId, reason, requesterId, requesterRole } = params;
					const userExists = await usersContract.getUserBasicInfo(userId);
			
					if (requesterId === userId) {
						throw new CannotSuspendSelfError();
					}
			
					if (requesterRole === 'user') {
						throw new InsufficientPermissionsError();
					}
			
					if (!userExists.exists) {
						throw new UserNotFoundError();
					}
			
					const activeSuspension = await queriesRepository.selectActiveSuspensionByUserId({ userId });
					if (activeSuspension) {
						throw new UserAlreadySuspendedError();
					}
			
					return commandsRepository.createSuspension({ userId, reason, moderatorId: requesterId });
		`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'suspendUser',
					params: [
						{ userId: 'number' },
						{ reason: 'string' },
						{ moderatorId: 'number' },
					],
					returns: ['UserSuspension'],
				},
			],
		},
	],
});
