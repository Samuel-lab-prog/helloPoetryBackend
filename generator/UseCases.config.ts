import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'get-friendship-status',
			type: 'query',

			dataModels: [
				{
					name: 'FriendshipRecord',
					properties: {
						userAId: 'number',
						userBId: 'number',
						status: 'string',
						createdAt: 'string',
					},
				},
				{
					name: 'FriendshipStatusSnapshot',
					properties: {
						exists: 'boolean',

						// none | pending_sent | pending_received | friends | blocked | rejected
						status: 'string',

						requesterId: 'number',

						canSendRequest: 'boolean',
						canAcceptRequest: 'boolean',
						canRemoveFriend: 'boolean',
					},
				},
			],

			errors: [],

			repositoryMethods: [
				{
					name: 'findFriendshipBetweenUsers',
					params: [
						{ name: 'userAId', type: 'number' },
						{ name: 'userBId', type: 'number' },
					],
					returns: ['FriendshipRecord', 'null'],
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
			] as const,

			useCaseFunc: {
				params: [
					{ name: 'viewerId', type: 'number' },
					{ name: 'targetUserId', type: 'number' },
				],
				returns: ['FriendshipStatusSnapshot'],
				body: `
					if (viewerId === targetUserId) {
						return {
							exists: false,
							status: 'none',
							requesterId: 0,
							canSendRequest: false,
							canAcceptRequest: false,
							canRemoveFriend: false,
						};
					}

					const friendship =
						await repository.findFriendshipBetweenUsers(
							viewerId,
							targetUserId,
						);

					if (!friendship) {
						return {
							exists: false,
							status: 'none',
							requesterId: 0,
							canSendRequest: true,
							canAcceptRequest: false,
							canRemoveFriend: false,
						};
					}

					if (friendship.status === 'pending') {
						const sentByViewer =
							friendship.userAId === viewerId;

						return {
							exists: true,
							status: sentByViewer
								? 'pending_sent'
								: 'pending_received',
							requesterId: friendship.userAId,
							canSendRequest: false,
							canAcceptRequest: !sentByViewer,
							canRemoveFriend: sentByViewer,
						};
					}

					if (friendship.status === 'accepted') {
						return {
							exists: true,
							status: 'friends',
							requesterId: friendship.userAId,
							canSendRequest: false,
							canAcceptRequest: false,
							canRemoveFriend: true,
						};
					}

					return {
						exists: true,
						status: friendship.status,
						requesterId: friendship.userAId,
						canSendRequest: false,
						canAcceptRequest: false,
						canRemoveFriend: false,
					};
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'getFriendshipStatus',
					params: [{ viewerId: 'number' }, { targetUserId: 'number' }],
					returns: ['FriendshipStatusSnapshot'],
				},
			],
		},
	],
});
