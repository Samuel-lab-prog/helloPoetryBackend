import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { type QueriesRouterServices } from '../ports/queries';
import { FeedPoemSchema } from '../ports/schemas/Index';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';

export function createFeedQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/feed' }).use(AuthPlugin).get(
		'/',
		({ auth }) => {
			console.log('Received request for feed with auth:', auth);
			return services.getFeed({
				userId: auth.clientId,
			});
		},
		{
			response: {
				200: t.Array(FeedPoemSchema),
				404: appErrorSchema,
			},
			detail: {
				summary: 'Get Home Feed',
				description: 'Retrieves home feed for authenticated user.',
				tags: ['Feed'],
			},
		},
	);
}
