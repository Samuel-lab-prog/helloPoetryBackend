import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'block-friend-request',
			type: 'command',

			dataModels: [],

			errors: [],

			repositoryMethods: [
				{
					name: 'blockFriendRequest',
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
								status: 'blocked',
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

					return repository.blockFriendRequest(
						fromUserId,
						toUserId,
					);
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'blockFriendRequest',
					params: [{ fromUserId: 'number' }, { toUserId: 'number' }],
					returns: ['FriendRequest'],
				},
			],
		},
	],
});
