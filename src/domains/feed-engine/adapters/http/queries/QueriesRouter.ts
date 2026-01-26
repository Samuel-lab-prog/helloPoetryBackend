import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { type QueriesRouterServices, queriesRouterServices } from './Services';

import { appErrorSchema } from '@AppError';

function createFeedQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/feed' }).use(AuthPlugin).get(
		'/',
		({ auth, query }) => {
			return services.getFeed({
				userId: auth.clientId,
				page: query.page ?? 1,
				pageSize: query.pageSize ?? 20,
			});
		},
		{
			response: {
				200: t.Array(t.Any()), // FeedItem schema can be complex, using t.Any() for brevity
				404: appErrorSchema,
				409: appErrorSchema,
			},
			query: t.Object({
				page: t.Optional(t.Number()),
				pageSize: t.Optional(t.Number()),
			}),
			detail: {
				summary: 'Get Home Feed',
				description: 'Retrieves home feed for authenticated user.',
				tags: ['Feed'],
			},
		},
	);
}

export const feedQueriesRouter = createFeedQueriesRouter(queriesRouterServices);
