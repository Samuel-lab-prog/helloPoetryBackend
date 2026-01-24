import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'accept-friend-request',
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
					name: 'acceptFriendRequest',
					params: [
						{ name: 'fromUserId', type: 'number' },
						{ name: 'toUserId', type: 'number' },
					],
					returns: ['FriendRequest'],
					body: `
						return prisma.friendship.updateMany({
							where: {
								userAId: fromUserId,
								userBId: toUserId,
								status: 'pending',
							},
							data: {
								status: 'accepted',
							},
						});
					`.trim(),
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
					{ name: 'fromUserId', type: 'number' },
					{ name: 'toUserId', type: 'number' },
				],
				returns: ['FriendRequest'],
				body: `
					if (fromUserId === toUserId) {
						throw new CannotSendRequestToYourselfError();
					}

					const targetUser = await repository.findUserById(toUserId);
					if (!targetUser) {
						throw new UserNotFoundError();
					}

					const existingFriendship =
						await repository.findFriendshipBetweenUsers(
							fromUserId,
							toUserId,
						);

					if (existingFriendship) {
						throw new FriendshipAlreadyExistsError();
					}

					return repository.acceptFriendRequest(
						fromUserId,
						toUserId,
					);
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'acceptFriendRequest',
					params: [{ fromUserId: 'number' }, { toUserId: 'number' }],
					returns: ['FriendRequest'],
				},
			],
		},
	],
});
