import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentsPageSchema } from '../ports/schemas/PoemCommentsPageSchema';

import { type QueriesRouterServices } from '../ports/queries';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';

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
				cursor: query.cursor,
				limit: query.limit,
			});
		},
		{
			params: t.Object({
				id: idSchema,
			}),
			query: t.Object({
				parentId: t.Optional(idSchema),
				cursor: t.Optional(idSchema),
				limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
			}),
			response: {
				200: PoemCommentsPageSchema,
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
