import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { type QueriesRouterServices, queriesRouterServices } from './Services';
import { feedPoemSchema } from '../../ports/schemas/Index';
import { appErrorSchema } from '@AppError';

export function createFeedQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/feed' }).use(AuthPlugin).get(
		'/',
		({ auth }) => {
			return services.getFeed({
				userId: auth.clientId,
			});
		},
		{
			response: {
				200: t.Array(feedPoemSchema),
				404: appErrorSchema,
				409: appErrorSchema,
			},
			detail: {
				summary: 'Get Home Feed',
				description: 'Retrieves home feed for authenticated user.',
				tags: ['Feed'],
			},
		},
	);
}

export const feedQueriesRouter = createFeedQueriesRouter(queriesRouterServices);
