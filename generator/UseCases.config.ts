import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'send-friend-request',
			type: 'command',

			dataModels: [
				{
					name: 'UserSummary',
					properties: {
						id: 'number',
						name: 'string',
						nickname: 'string',
					},
				},
				{
					name: 'FriendRequest',
					properties: {
						fromUserId: 'number',
						toUserId: 'number',
						status: 'string',
						createdAt: 'string',
					},
				},
			],

			errors: [
				{
					name: 'UserNotFoundError',
					type: 'NOT_FOUND',
					message: 'Target user not found.',
				},
				{
					name: 'CannotSendRequestToYourselfError',
					type: 'VALIDATION_FAILED',
					message: 'You cannot send a friend request to yourself.',
				},
				{
					name: 'FriendshipAlreadyExistsError',
					type: 'CONFLICT',
					message:
						'A friendship or request already exists between these users.',
				},
			],

			repositoryMethods: [
				{
					name: 'findUserById',
					params: [{ name: 'id', type: 'number' }],
					returns: ['UserSummary', 'null'],
					body: `
						const user = await prisma.user.findUnique({
							where: { id },
							select: userSelectModel,
						});
						return user;
					`.trim(),
					selectModel: {
						name: 'userSelectModel',
						body: `
							id: true,
							name: true,
							nickname: true,
						`.trim(),
					},
				},
				{
					name: 'findFriendshipBetweenUsers',
					params: [
						{ name: 'userAId', type: 'number' },
						{ name: 'userBId', type: 'number' },
					],
					returns: ['FriendRequest', 'null'],
					body: `
						return prisma.friendship.findFirst({
							where: {
								OR: [
									{ userAId, userBId },
									{ userAId: userBId, userBId: userAId },
								],
							},
						});
					`.trim(),
				},
				{
					name: 'createFriendRequest',
					params: [
						{ name: 'fromUserId', type: 'number' },
						{ name: 'toUserId', type: 'number' },
					],
					returns: ['FriendRequest'],
					body: `
						return prisma.friendship.create({
							data: {
								userAId: fromUserId,
								userBId: toUserId,
								status: 'pending',
							},
						});
					`.trim(),
				},
			] as const,

			useCaseFunc: {
				params: [
					{ name: 'requesterId', type: 'number' },
					{ name: 'targetUserId', type: 'number' },
				],
				returns: ['FriendRequest'],
				body: `
					if (requesterId === targetUserId) {
						throw new CannotSendRequestToYourselfError();
					}

					const targetUser = await repository.findUserById(targetUserId);
					if (!targetUser) {
						throw new UserNotFoundError();
					}

					const existingFriendship =
						await repository.findFriendshipBetweenUsers(
							requesterId,
							targetUserId,
						);

					if (existingFriendship) {
						throw new FriendshipAlreadyExistsError();
					}

					return repository.createFriendRequest(
						requesterId,
						targetUserId,
					);
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'sendFriendRequest',
					params: [{ requesterId: 'number' }, { targetUserId: 'number' }],
					returns: ['FriendRequest'],
				},
			],
		},
	],
});
