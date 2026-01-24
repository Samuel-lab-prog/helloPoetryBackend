import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'delete-friend',
			type: 'command',

			dataModels: [],

			errors: [],

			repositoryMethods: [
				{
					name: 'deleteFriend',
					params: [
						{ name: 'fromUserId', type: 'number' },
						{ name: 'toUserId', type: 'number' },
					],
					returns: ['FriendRequest'],
					body: `
						return prisma.friendship.deleteAndReturn({
							where: {
								userAId: fromUserId,
								userBId: toUserId,
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

					return repository.deleteFriend(
						fromUserId,
						toUserId,
					);
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'deleteFriend',
					params: [{ fromUserId: 'number' }, { toUserId: 'number' }],
					returns: ['FriendRequest'],
				},
			],
		},
	],
});
