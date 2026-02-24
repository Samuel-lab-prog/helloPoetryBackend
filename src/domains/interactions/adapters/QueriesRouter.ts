import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentSchema } from '../ports/schemas/PoemCommentSchema';

import { type QueriesRouterServices } from '../ports/Queries';
import { appErrorSchema } from '@GenericSubdomains/utils/appError';

export function createInteractionsQueriesRouter(
	services: QueriesRouterServices,
) {
	return new Elysia({ prefix: '/interactions' }).use(AuthPlugin).get(
		'/poems/:id/comments',
		({ params, auth, query }) => {
			return services.getPoemComments({
				poemId: params.id,
				userId: auth.clientId,
				parentId: query.parentId,
			});
		},
		{
			params: t.Object({
				id: idSchema,
			}),
			query: t.Object({
				parentId: t.Optional(idSchema),
			}),
			response: {
				200: t.Array(PoemCommentSchema),
				404: appErrorSchema,
				409: appErrorSchema,
			},
			detail: {
				summary: 'Get Poem Comments',
				description: 'Retrieves comments for a poem.',
				tags: ['Interactions'],
			},
		},
	);
}
