import { defineUseCases } from './src/DefineUseCases';

export default defineUseCases({
	domain: 'friends-management',

	useCases: [
		{
			name: 'cancel-friend-request',
			type: 'query',

			dataModels: [],

			errors: [],

			repositoryMethods: [
				{
					name: 'selectFeedItems',
					params: [
						{ name: 'userId', type: 'number' },
						{ name: 'limit', type: 'number' },
						{ name: 'offset', type: 'number' },
					],
					returns: ['FeedItem[]'],
					body: `
return prisma.post.findMany({
	where: {
		visibility: 'public'
	},
	orderBy: {
		createdAt: 'desc'
	},
	take: limit,
	skip: offset,
});
					`.trim(),
				},
			],

			useCaseFunc: {
				params: [
					{ name: 'userId', type: 'number' },
					{ name: 'page', type: 'number' },
					{ name: 'pageSize', type: 'number' },
				],
				returns: ['FeedItem[]'],
				body: `
const { userId, page, pageSize } = params;

const offset = (page - 1) * pageSize;

return queriesRepository.selectFeedItems({
	userId,
	limit: pageSize,
	offset,
});
				`.trim(),
			} as const,

			serviceFunctions: [
				{
					useCaseFuncName: 'getFeed',
					params: [
						{ userId: 'number' },
						{ page: 'number' },
						{ pageSize: 'number' },
					],
					returns: ['FeedItem[]'],
				},
			],
		},
	],
});
